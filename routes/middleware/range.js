module.exports = (fileSize, ctx) => {
  const range = ctx.headers.range;
  if (!range) {
    return {code: 200};
  }
  const sizes = range.match(/bytes=(\d*)-(\d*)/);
  const end = sizes[2] || fileSize - 1;
  const start = sizes[1] || fileSize - end;

  if (start > end || start < 0 || end > fileSize) {
    return {code: 200};
  }

  ctx.set('Accept-Ranges', 'bytes');
  ctx.set('Content-Length', end - start + 1);
  ctx.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
  ctx.type = 'application/octet-stream';
  return {
    code: 206,
    start: parseInt(start),
    end: parseInt(end),
  }
}