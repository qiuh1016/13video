const router = require('koa-router')()
// router.prefix('/')

const site = require('./routes/controller/site');
router.get ('/', site.homepage);
router.get ('/file', site.file);
router.get ('/video', site.video);

module.exports = router;