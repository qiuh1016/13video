const router = require('koa-router')()
// router.prefix('/')

const site = require('./routes/controller/site');
router.get ('/', site.homepage);
router.get ('/file', site.file);

module.exports = router;