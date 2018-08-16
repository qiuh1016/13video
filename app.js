const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const koa_logger = require('koa-logger')
const logger = require('./routes/common/logger')
global.logger = logger;

const web_router = require('./web_router')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
// app.use(koa_logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(async (ctx, next) => {
  switch (ctx.status) {
    case 404:
      await ctx.render('error', {
        message: 'error',
        error: {
          status: ctx.status,
          stack: 'Page Not Found'
        }
      });
      break;
  }
  await next();
})

// routes
app.use(web_router.routes(), web_router.allowedMethods())

module.exports = app
