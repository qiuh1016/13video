const {createGzip, createDeflate} = require('zlib');

module.exports = (stream, ctx) => {
  const acceptEncoding = ctx.headers['accept-encoding'];
  if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) {
    return stream;
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    ctx.set('Content-Encoding', 'gzip');
    return stream.pipe(createGzip);
  } else if (acceptEncoding.match(/\deflate\b/)) {
    ctx.set('Content-Encoding', 'deflate');    
    return stream.pipe(createDeflate);
  } 
}