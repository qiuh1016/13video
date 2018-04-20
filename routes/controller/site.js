const fs = require('fs');
const moment = require('moment');
const join = require('path').join;
const send = require('koa-send');

const PassThrough = require('stream').PassThrough;
moment.locale('zh-cn');

exports.homepage = async function(ctx, next) {
  await ctx.render('page/index/index', {
  });
}


exports.file = async function(ctx, next) {
  let path = ctx.query.path || '/public';
  dirPath = __dirname + '/../../' + path;
  let stats = fs.statSync(dirPath);
  if (stats.isFile()) {
    ctx.attachment(dirPath);
    await send(ctx, path);
  } else {
    let fileArr = findFilesSync(dirPath);
    await ctx.render('page/video/index', {
      path: path,
      pathArr: path.split('/'),
      fileArr: fileArr,
      join: join
    });
  }
}

exports.video = async function(ctx, next) {
  let path = ctx.query.path;
  if (path.slice(0, 1) == '/' || path.slice(0, 1) == '\\') path = path.slice(1, path.length);
  let name = ctx.query.name;
  let realPath = join(path, name); //getPath(['public', 'documents', 'video', name]);

  if (ctx.headers.range) {

    let fileSize = fs.statSync(realPath).size;

    function getRange(){
      var range = ctx.headers.range;
      
      if(range.indexOf(",") != -1) {//这里只处理了一个分段的情况
          return false;
      }
      //range大约长这样子：bytes=0-255[,256-511]
      var parts = range.replace(/bytes=/, '').split("-");
      var partiaStart = parts[0];
      var partialEnd = parts[1];

      var start = parseInt(partiaStart);//起始位置
      //如果是bytes=0-，就是整个文件大小了
      var end = partialEnd ? parseInt(partialEnd) : fileSize - 1;

      if(isNaN(start) || isNaN(end)) return false;
      //分段的大小
      var chunkSize = end - start + 1;

      return {'start': start, 'end': end, 'chunkSize': chunkSize};
    }

    var rangeData = getRange();

    if (rangeData) {
      var stream = fs.createReadStream(realPath, {start: rangeData.start, end: rangeData.end});
      ctx.status = 206;
      ctx.set('Accept-Ranges', 'bytes');
      ctx.set('Content-Length', rangeData.chunkSize);    
      ctx.set('Content-Range', `bytes ${rangeData.start}-${rangeData.end}/${fileSize}`);
      ctx.type = 'application/octet-stream';
      ctx.body = stream.on('error', ctx.onerror).pipe(PassThrough());
    }
  }
}

/**
 * 把文件夹数组转为路径
 */
function getPath(arr) {
  if (arr.length <= 1) {
    return arr[0]
  } else {
    let path = arr[0];
    for (var i = 1; i < arr.length; i++) {
      path = join(path, arr[i]);
    }
    return path;
  }
}

/**
 * 获取文件信息
 * @param {JSON} path 
 */
function findFilesSync(path) {
  let result = [];
  let files = fs.readdirSync(path);
  files.forEach((val, index) => {
      let filePath = join(path, val);
      let stats = fs.statSync(filePath);
      if (val.substr(0, 1) != '.') {

        let fileInfo = {
          isFile: stats.isFile(),
          name: val
        }
        if (stats.isFile()) {
          fileInfo.icon = getIconByFileType(val);
        } else {
          fileInfo.icon = 'fa-folder-o';
        }
        result.push(fileInfo);
      }
  });
  return result;
}

/**
 * 根据文件后缀名获取图标class名
 * @param {String} filename 
 */
function getIconByFileType(filename) {
  let iconClass = 'fa-file-o';
  let length = filename.split('.').length;
  let postfix = filename.split('.')[length - 1];
  switch (postfix) {
    case 'jpg': case 'png': case 'bmp': case 'gif':
    // 图片
      iconClass = 'fa-file-image-o';
      break;
    case 'flv': case 'mp4': case 'mpg': case 'mpeg': case 'avi':
    // 视频
      iconClass = 'fa-file-video-o';
      break;
    case 'mp3': case 'wma': case 'flac': case 'acc': case 'wav':
    // 音频
      iconClass = 'fa-file-audio-o';
      break;
    case 'zip': case 'rar': case '7z':
    // 压缩文件
      iconClass = 'fa-file-zip-o';
      break;
    case 'css': case 'js': case 'html': case 'java': case 'c': case 'cpp':
    // 编程文件
      iconClass = 'fa-file-code-o';
      break;
    case 'pdf':
    // pdf
      iconClass = 'fa-file-pdf-o';
      break;
    case 'xls': case 'xlsx':
    // excel
      iconClass = 'fa-file-excel-o';
      break;
    case 'doc': case 'docx':
    // word
      iconClass = 'fa-file-word-o';
      break;
    case 'ppt': case 'pptx':
    // ppt
      iconClass = 'fa-file-powerpoint-o';
      break;
    case 'txt':
      iconClass = 'fa-file-text-o';
      break;
  }
  return iconClass
}