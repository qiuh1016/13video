const fs = require('fs');
const moment = require('moment');
const join = require('path').join;
const send = require('koa-send');
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
          type: stats.isFile(),
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