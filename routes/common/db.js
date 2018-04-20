var mysql = require('mysql');
var config = require('../../config')

var pool  = mysql.createPool({
  host     : config.database.HOST,
  user     : config.database.USERNAME,
  password : config.database.PASSWORD,
  database : config.database.DATABASE
});

let query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        resolve( err )
      } else {
        connection.query(sql, values, ( err, rows) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}

User =
`create table if not exists User(
 id INT NOT NULL AUTO_INCREMENT,
 UserPhone VARCHAR(255),
 CheckCode VARCHAR(255),
 State INT NOT NULL,
 DateTime DATETIME,
 PRIMARY KEY ( id )
);`

SMS =
`create table if not exists SMS(
 id INT NOT NULL AUTO_INCREMENT,
 SMSType INT NOT NULL, 
 Sender VARCHAR(255),
 Receiver VARCHAR(255),
 Message VARCHAR(80),
 Lon VARCHAR(255),
 Lat VARCHAR(255),
 Co VARCHAR(255),
 GpsTime DATETIME,
 State INT NOT NULL,
 DateTime DATETIME,
 Token VARCHAR(255),
 GroupId VARCHAR(255),
 PRIMARY KEY ( id )
);`

MyShipLocus =
`create table if not exists MyShipLocus(
  id INT NOT NULL AUTO_INCREMENT,
  Lon VARCHAR(255),
  Lat VARCHAR(255),
  Co VARCHAR(255),
  GpsTime DATETIME, 
  PRIMARY KEY ( id )
);`

LocalRadio =
`create table if not exists LocalRadio(
  id INT NOT NULL AUTO_INCREMENT,
  Lon VARCHAR(255),
  Lat VARCHAR(255),
  Co VARCHAR(255),
  GpsTime DATETIME, 
  SMSVersion VARCHAR(255),
  PRIMARY KEY ( id )
);`

let createTable = function( sql ) {
  return query( sql, [] )
}

// 建表
createTable(User)
createTable(SMS)
createTable(MyShipLocus)
createTable(LocalRadio)

let getGroupID = function(sender, receiver) {
  let _sql = "select * from SMS where (Sender = ? and Receiver = ?) or (Sender = ? and Receiver = ?) limit 1";
  return query(_sql, [sender, receiver, receiver, sender]);
}

let insertSms = function(sender, receiver, message, state, smsType, dateTime, token, groupId) {
  let _sql = "insert into SMS(Sender, Receiver, Message, State, SMSType, DateTime, Token, GroupId) values(?,?,?,?,?,?,?,?)";
  return query(_sql, [sender, receiver, message, state, smsType, dateTime, token, groupId]);
}

let insertGpsSms = function(smsType, sender, receiver, lon, lat, co, GpsTime, dateTime, token) {
  let _sql = "insert into SMS(SMSType, Sender, Receiver, Lon, Lat, Co, GpsTime, DateTime, Token) values(?,?,?,?,?,?,?,?,?)";
  return query(_sql, [smsType, sender, receiver, lon, lat, co, GpsTime, dateTime, token]);
}

let getLastLocalRadio = function() {
  let _sql = "select * from LocalRadio order by id desc limit 1";
  return query(_sql, []);
}

let updateSmsVersion = function(SMSVersion, id) {
  let _sql = "update LocalRadio set SMSVersion=? where id=?";
  return query(_sql, [SMSVersion, id]);
}

// 分组获取最新一条数据
let getList = function (receiver, smsType) {
  let _sql = "select * from SMS a where a.id IN (SELECT MAX(id) FROM SMS WHERE Receiver = ? AND SMSType = ? GROUP BY Sender) ORDER BY a.id DESC";
  return query(_sql, [receiver, smsType]);
}

module.exports = {
  query,
  createTable,
  
  getGroupID,
  insertSms,
  insertGpsSms,
  getLastLocalRadio,
  updateSmsVersion,

  getList,
}



// 注册用户
let insertUser = function(UserPhone, CheckCode, State, DateTime) {
  let _sql = "insert into User(UserPhone, CheckCode, State, DateTime) values(?,?,?,?);"
  return query( _sql, [UserPhone, CheckCode, State, DateTime] )
}

// 通过文章的名字查找用户
let findAllUser = function () {
  let _sql = `SELECT * from User`
  return query( _sql)
}

// 以下为demo 
// 发表文章
let insertPost = function( value ) {
  let _sql = "insert into posts(name,title,content,uid,moment) values(?,?,?,?,?);"
  return query( _sql, value )
}
// 更新文章评论数
let updatePostComment = function( value ) {
  let _sql = "update posts set  comments=? where id=?"
  return query( _sql, value )
}

// 更新浏览数
let updatePostPv = function( value ) {
  let _sql = "update posts set  pv=? where id=?"
  return query( _sql, value )
}

// 发表评论
let insertComment = function( value ) {
  let _sql = "insert into comment(name,content,postid) values(?,?,?);"
  return query( _sql, value )
}
// 通过名字查找用户
let findDataByName = function (  name ) {
  let _sql = `
    SELECT * from users
      where name="${name}"
      `
  return query( _sql)
}
// 通过文章的名字查找用户
let findDataByUser = function (  name ) {
  let _sql = `
    SELECT * from posts
      where name="${name}"
      `
  return query( _sql)
}
// 通过文章id查找
let findDataById = function (  id ) {
  let _sql = `
    SELECT * from posts
      where id="${id}"
      `
  return query( _sql)
}
// 通过评论id查找
let findCommentById = function ( id ) {
  let _sql = `
    SELECT * FROM comment where postid="${id}"
      `
  return query( _sql)
}

// 查询所有文章
let findAllPost = function (  ) {
  let _sql = `
    SELECT * FROM posts
      `
  return query( _sql)
}
// 更新修改文章
let updatePost = function(values){
  let _sql=`update posts set  title=?,content=? where id=?`
  return query(_sql,values)
}
// 删除文章
let deletePost = function(id){
  let _sql=`delete from posts where id = ${id}`
  return query(_sql)
}
// 删除评论
let deleteComment = function(id){
  let _sql=`delete from comment where id = ${id}`
  return query(_sql)
}
// 删除所有评论
let deleteAllPostComment = function(id){
  let _sql=`delete from comment where postid = ${id}`
  return query(_sql)
}
// 查找
let findCommentLength = function(id){
  let _sql=`select content from comment where postid in (select id from posts where id=${id})`
  return query(_sql)
}
