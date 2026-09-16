/** @type {import('next').NextConfig} */
const nextConfig = {
  // The VIN OCR route starts Tesseract worker threads at runtime. Next/Vercel's
  // automatic tracing does not discover those dynamically loaded files, so
  // explicitly include the worker/core packages in the serverless function.
  outputFileTracingIncludes: {
    '/api/scan-vin': [
      './node_modules/tesseract.js/**/*',
      './node_modules/tesseract.js-core/**/*',
    ],
  },
};

module.exports = nextConfig;
