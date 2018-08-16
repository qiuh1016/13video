const router = require('koa-router')()

const multer = require('koa-multer');//加载koa-multer模块
//文件上传
//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  //修改文件名称
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
//加载配置
var upload = multer({ storage: storage });


// router.prefix('/')

const site = require('./routes/controller/site');
router.get('/', site.homepage);
router.get('/file', site.file);
router.get('/video', site.video);
router.get('/upload', site.showUpload);
router.post('/upload', upload.single('file'), site.upload);

module.exports = router;