const router = require('koa-router')()
// router.prefix('/')

const site = require('./routes/controller/site');
router.get('/', site.homepage);
router.get('/file', site.file);
router.get('/video', site.video);
router.get('/upload', site.showUpload);
router.post('/upload', site.uploadMulter.single('file'), site.upload);

module.exports = router;