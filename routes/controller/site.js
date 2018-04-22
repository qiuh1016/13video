const fs = require('fs');
const moment = require('moment');
const join = require('path').join;
const send = require('koa-send');
const FFmpeg = require('fluent-ffmpeg');
const range = require('../middleware/range');
const compress = require('../middleware/compress');

const PassThrough = require('stream').PassThrough;
moment.locale('zh-cn');

const thumbnailFolderName = 'thumbnail';

exports.homepage = async function(ctx, next) {
  await ctx.render('page/index/index', {
  });
}

exports.file = async function(ctx, next) {
  let path = ctx.query.path || 'public';
  dirPath = getPath([__dirname, '..', '..', path]); //__dirname + '/../../' + path;
  let stats = fs.statSync(dirPath);
  if (stats.isFile()) {
    ctx.attachment(dirPath);
    await send(ctx, path);
  } else {
    let fileArr = findFilesSync(dirPath);
    let pathArr = [];
    if (path.includes('/')) {
      pathArr = path.split('/')
    } else {
      pathArr = path.split('\\')
    }
    await ctx.render('page/video/index', {
      path: path,
      pathArr: pathArr,
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

  let fileSize = fs.statSync(realPath).size;
  let stream;
  const {code, start, end} = range(fileSize, ctx);
  if (code == 200) {
    ctx.status = 200;
    stream = fs.createReadStream(realPath);
  } else {
    ctx.status = 206;
    stream = fs.createReadStream(realPath, {start, end});
  }
  // stream = compress(stream, ctx);
  ctx.body = stream.on('error', ctx.onerror).pipe(PassThrough());
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
 * fileInfo = {
 *  isFile: '是否是文件',
 *  name: '名称',
 *  size: '大小',
 *  icon: '图标class',
 *  thumbnailExist: '缩略图是否存在'
 * }
 */
function findFilesSync(path) {
  let result = [];
  let files = fs.readdirSync(path);
  files.forEach((val, index) => {
      let filePath = join(path, val);
      let stats = fs.statSync(filePath);
      // 去掉缩略图文件夹显示
      if (val.substr(0, 1) != '.' && val != thumbnailFolderName) {
        let fileInfo = {
          isFile: stats.isFile(),
          name: val,
          size: formatfileSize(stats.size)
        }
        if (stats.isFile()) {
          fileInfo.icon = getIconByFileType(val);
        } else {
          fileInfo.icon = 'fa-folder-o';
        }
        fileInfo.thumbnailExist = false;
        if (fileInfo.icon == 'fa-file-video-o') {
          let thumbnailPath = join(path, join(thumbnailFolderName, val + '.png'))
          if (fs.existsSync(thumbnailPath)) {
            fileInfo.thumbnailExist = true;
          }
        }
        result.push(fileInfo);
      }
  });
  return result;
}

function formatfileSize(size) {
  if (size < 1024) return size + 'B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB';
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + 'MB';
  if (size < 1024 * 1024 * 1024 * 1024) return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB';
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
    case 'flv': case 'mp4': case 'mpg': case 'mpeg': case 'mov':
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

/**
 * 生成视频文件缩略图
 */
function generalThumbnail(path, filename) {

  let thumbnailFolderPath = join(path, thumbnailFolderName);

  if (!fs.existsSync(thumbnailFolderPath)) {
    fs.mkdirSync(thumbnailFolderPath);
  }

  let thumbnailFilename = filename + '.png';
  let thumbnailFilePath = join(thumbnailFolderPath, thumbnailFilename);

  if (fs.existsSync(thumbnailFilePath)) {
    logger.debug('thumbnail exists')
    return;
  }

  let startTime = new Date().valueOf();
  new FFmpeg({ source: join(path, filename) })
    // .withSize('320x240')
    .on('error', function(err) {
      logger.error('An error occurred: ' + err.message);
    })
    .on('end', function(filenames) {
      let endTime = new Date().valueOf()
      logger.info(`Thumbnail successfully generated: ${endTime - startTime}ms`);
    })
    .takeScreenshots(
      {
          count: 1,
          timemarks: [ '0.5' ],
          filename: thumbnailFilename
      },
      thumbnailFolderPath
  );

}