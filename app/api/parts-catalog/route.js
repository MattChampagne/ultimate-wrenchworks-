const API_BASE='https://auto-parts-catalog.apiprofile.com/api/v2';

function cleanVin(value){return String(value??'').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'').slice(0,17);}
function cleanQuery(value){return String(value??'').trim().slice(0,120);}
function findValue(value,names,depth=0){if(depth>10||value==null)return undefined;if(Array.isArray(value)){for(const item of value){const found=findValue(item,names,depth+1);if(found!==undefined)return found;}return undefined;}if(typeof value!=='object')return undefined;const wanted=new Set(names.map(x=>x.toLowerCase()));for(const [key,val] of Object.entries(value)){if(wanted.has(key.toLowerCase())&&val!==null&&val!==''&&typeof val!=='object')return val;}for(const val of Object.values(value)){const found=findValue(val,names,depth+1);if(found!==undefined)return found;}return undefined;}
function collectObjects(value,predicate,out=[],depth=0){if(depth>10||value==null)return out;if(Array.isArray(value)){for(const item of value)collectObjects(item,predicate,out,depth+1);return out;}if(typeof value!=='object')return out;if(predicate(value))out.push(value);for(const val of Object.values(value))if(typeof val==='object'&&val!==null)collectObjects(val,predicate,out,depth+1);return out;}
function firstNumber(obj,names){const raw=findValue(obj,names);const n=Number(raw);return Number.isFinite(n)&&n>0?n:null;}
function firstText(obj,names){const raw=findValue(obj,names);return raw==null?'':String(raw);}
async function catalogFetch(path,key){const response=await fetch(`${API_BASE}${path}`,{headers:{Accept:'application/json','x-apiprofile-key':key},cache:'no-store'});const text=await response.text();let data;try{data=JSON.parse(text);}catch{data={message:text};}if(!response.ok){const error=new Error(data?.message||data?.error||`Catalog request failed (${response.status}).`);error.status=response.status;throw error;}return data;}
function normalizeArticle(item){return{articleId:firstNumber(item,['articleId','article_id','id']),partNumber:firstText(item,['articleNumber','articleNo','article_number','partNumber','part_number','number']),brand:firstText(item,['brandName','brand','supplierName','supplier']),description:firstText(item,['articleProductName','description','articleName','productName','name']),imageUrl:firstText(item,['s3image','imageUrl','image','thumbnailUrl','thumbnail']),raw:item};}
function normalizeWords(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);}
function categoryScore(category,query){const name=String(category.name||'').toLowerCase().trim();const q=String(query||'').toLowerCase().trim();if(!name)return 0;if(name===q)return 1000;if(name.includes(q))return 800+q.length;if(q.includes(name))return 500+name.length;const qWords=normalizeWords(q);const nWords=new Set(normalizeWords(name));const overlap=qWords.filter(w=>nWords.has(w)).length;return overlap*100+(overlap===qWords.length&&qWords.length?200:0)-Math.abs(name.length-q.length)/10;}

export async function GET(request){
  const key=process.env.AUTOPARTS_API_KEY;
  if(!key)return Response.json({ok:false,configured:false,error:'Direct catalog is not configured yet. Add AUTOPARTS_API_KEY in Vercel.'},{status:503});
  const {searchParams}=new URL(request.url);
  const vin=cleanVin(searchParams.get('vin'));
  const query=cleanQuery(searchParams.get('q'));
  if(vin.length!==17)return Response.json({ok:false,configured:true,error:'A valid 17-character VIN is required for direct fitment lookup.'},{status:400});
  if(query.length<2)return Response.json({ok:false,configured:true,error:'Enter a part name or repair item to search.'},{status:400});
  try{
    const matched=await catalogFetch(`/vin/tecdoc-vin-check/${encodeURIComponent(vin)}`,key);
    const vehicleObjects=collectObjects(matched,obj=>Object.keys(obj).some(k=>['vehicleId','vehicleID','vehicle_id','carId','car_id','id'].includes(k)));
    const vehicleSource=vehicleObjects.find(obj=>firstNumber(obj,['vehicleId','vehicleID','vehicle_id','carId','car_id']))||vehicleObjects[0]||matched;
    const vehicleId=firstNumber(vehicleSource,['vehicleId','vehicleID','vehicle_id','carId','car_id','id']);
    let typeId=firstNumber(vehicleSource,['typeId','type_id','vehicleTypeId','vehicle_type_id','type']);
    if(![1,2,3].includes(typeId))typeId=1;
    if(!vehicleId)return Response.json({ok:false,configured:true,error:'The catalog VIN lookup responded, but no catalog vehicle ID was returned for this VIN.'},{status:404});

    const categoryData=await catalogFetch(`/category/search-for-the-commodity-group-tree-by-description/type-id/${typeId}/lang-id/4/search-text/${encodeURIComponent(query)}`,key);
    const categoryObjects=collectObjects(categoryData,obj=>Object.keys(obj).some(k=>['categoryId','categoryID','category_id'].includes(k)));
    const categoryMap=new Map();
    for(const item of categoryObjects){const categoryId=firstNumber(item,['categoryId','categoryID','category_id']);const name=firstText(item,['description','categoryName','name','text']);if(categoryId&&!categoryMap.has(`${categoryId}|${name}`))categoryMap.set(`${categoryId}|${name}`,{categoryId,name});}
    const categories=[...categoryMap.values()].sort((a,b)=>categoryScore(b,query)-categoryScore(a,query));
    if(!categories.length)return Response.json({ok:true,configured:true,vin,vehicleId,typeId,vehicle:matched,categories:[],parts:[],message:'The VIN matched a catalog vehicle, but no category matched that part search. Try a shorter term such as oil filter, brake pad, bearing, belt, or alternator.'});

    const selected=categories[0];
    const articleData=await catalogFetch(`/articles/list/type-id/${typeId}/vehicle-id/${vehicleId}/category-id/${selected.categoryId}/lang-id/4`,key);
    const articleObjects=collectObjects(articleData,obj=>Object.keys(obj).some(k=>['articleId','articleNumber','articleNo','article_number'].includes(k)));
    const seen=new Set();
    const parts=[];
    for(const item of articleObjects){const part=normalizeArticle(item);const id=`${part.articleId||''}|${part.brand}|${part.partNumber}`;if(!part.partNumber||seen.has(id))continue;seen.add(id);parts.push(part);if(parts.length>=40)break;}
    return Response.json({ok:true,configured:true,vin,vehicleId,typeId,vehicle:matched,category:selected,categories:categories.slice(0,10),parts});
  }catch(error){console.error('Direct parts catalog lookup failed',error);const status=[400,401,403,404,429].includes(error.status)?error.status:502;return Response.json({ok:false,configured:true,error:error.message||'Direct catalog lookup failed.'},{status});}
}
