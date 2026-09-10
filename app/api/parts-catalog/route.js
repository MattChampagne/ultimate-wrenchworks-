const API_BASE='https://auto-parts-catalog.apiprofile.com/api/v2';

function cleanVin(value){return String(value??'').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'').slice(0,17);}
function cleanQuery(value){return String(value??'').trim().slice(0,120);}
function asArray(value){if(Array.isArray(value))return value;if(Array.isArray(value?.data))return value.data;if(Array.isArray(value?.results))return value.results;return [];}
function findValue(value,names,depth=0){if(depth>8||value==null)return undefined;if(Array.isArray(value)){for(const item of value){const found=findValue(item,names,depth+1);if(found!==undefined)return found;}return undefined;}if(typeof value!=='object')return undefined;for(const [key,val] of Object.entries(value)){if(names.includes(key.toLowerCase())&&val!==null&&val!==''&&typeof val!=='object')return val;}for(const val of Object.values(value)){const found=findValue(val,names,depth+1);if(found!==undefined)return found;}return undefined;}
function collectObjects(value,predicate,out=[],depth=0){if(depth>9||value==null)return out;if(Array.isArray(value)){for(const item of value)collectObjects(item,predicate,out,depth+1);return out;}if(typeof value!=='object')return out;if(predicate(value))out.push(value);for(const val of Object.values(value))if(typeof val==='object'&&val!==null)collectObjects(val,predicate,out,depth+1);return out;}
function firstNumber(obj,names){const raw=findValue(obj,names.map(x=>x.toLowerCase()));const n=Number(raw);return Number.isFinite(n)?n:null;}
function firstText(obj,names){const raw=findValue(obj,names.map(x=>x.toLowerCase()));return raw==null?'':String(raw);}
async function catalogFetch(path,key){const response=await fetch(`${API_BASE}${path}`,{headers:{Accept:'application/json','x-apiprofile-key':key},cache:'no-store'});const text=await response.text();let data;try{data=JSON.parse(text);}catch{data={message:text};}if(!response.ok){const error=new Error(data?.message||`Catalog request failed (${response.status}).`);error.status=response.status;throw error;}return data;}
function normalizeArticle(item){return{articleId:firstNumber(item,['articleId','article_id','id']),partNumber:firstText(item,['articleNumber','articleNo','article_number','partNumber','part_number','number']),brand:firstText(item,['brandName','brand','supplierName','supplier']),description:firstText(item,['description','articleName','productName','name']),imageUrl:firstText(item,['imageUrl','image','thumbnailUrl','thumbnail']),raw:item};}

export async function GET(request){
  const key=process.env.AUTOPARTS_API_KEY;
  if(!key)return Response.json({ok:false,configured:false,error:'Direct catalog is not configured yet. Add AUTOPARTS_API_KEY in Vercel.'},{status:503});
  const {searchParams}=new URL(request.url);
  const vin=cleanVin(searchParams.get('vin'));
  const query=cleanQuery(searchParams.get('q'));
  if(vin.length!==17)return Response.json({ok:false,configured:true,error:'A valid 17-character VIN is required for direct fitment lookup.'},{status:400});
  if(query.length<2)return Response.json({ok:false,configured:true,error:'Enter a part name or repair item to search.'},{status:400});
  try{
    const decoded=await catalogFetch(`/vin/decoder-v2/${encodeURIComponent(vin)}`,key);
    const vehicleObjects=collectObjects(decoded,obj=>Object.keys(obj).some(k=>['vehicleId','vehicleID','vehicle_id'].includes(k)));
    const vehicleSource=vehicleObjects[0]||decoded;
    const vehicleId=firstNumber(vehicleSource,['vehicleId','vehicleID','vehicle_id']);
    let typeId=firstNumber(vehicleSource,['typeId','type_id','vehicleTypeId','vehicle_type_id']);
    if(![1,2,3].includes(typeId))typeId=1;
    if(!vehicleId)return Response.json({ok:false,configured:true,error:'The catalog could not match this VIN to a catalog vehicle. Use the supplier shortcuts for this request.'},{status:404});

    const categoryData=await catalogFetch(`/category/search-for-the-commodity-group-tree-by-description/type-id/${typeId}/lang-id/4/search-text/${encodeURIComponent(query)}`,key);
    const categoryObjects=collectObjects(categoryData,obj=>Object.keys(obj).some(k=>['categoryId','categoryID','category_id'].includes(k)));
    const categories=categoryObjects.map(item=>({categoryId:firstNumber(item,['categoryId','categoryID','category_id']),name:firstText(item,['description','categoryName','name','text'])})).filter(x=>x.categoryId);
    if(!categories.length)return Response.json({ok:true,configured:true,vin,vehicleId,typeId,vehicle:decoded,categories:[],parts:[],message:'No direct catalog category matched that search. Try a shorter part name such as brake pad, oil filter, bearing, belt, or alternator.'});

    const selected=categories[0];
    const articleData=await catalogFetch(`/articles/list/type-id/${typeId}/vehicle-id/${vehicleId}/category-id/${selected.categoryId}/lang-id/4`,key);
    const articleObjects=collectObjects(articleData,obj=>Object.keys(obj).some(k=>['articleId','articleNumber','articleNo','article_number'].includes(k)));
    const seen=new Set();
    const parts=[];
    for(const item of articleObjects){const part=normalizeArticle(item);const id=`${part.articleId||''}|${part.brand}|${part.partNumber}`;if(!part.partNumber||seen.has(id))continue;seen.add(id);parts.push(part);if(parts.length>=40)break;}
    return Response.json({ok:true,configured:true,vin,vehicleId,typeId,vehicle:decoded,category:selected,categories:categories.slice(0,10),parts});
  }catch(error){console.error('Direct parts catalog lookup failed',error);const status=[401,403,429].includes(error.status)?error.status:502;return Response.json({ok:false,configured:true,error:error.message||'Direct catalog lookup failed.'},{status});}
}
