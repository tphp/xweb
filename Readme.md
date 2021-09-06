#### 使用说明

- 使用基本步骤请参考: [koa-web](https://www.npmjs.com/package/koa-web)
- 新增session的支持，[koa-session](https://www.npmjs.com/package/koa-session) 数据保存到根目录的.cache中

#### 安装 xweb

```
npm i xweb
```

#### 使用实例

```js
const Xweb = require("xweb");

const web = new Xweb();

// 应用于 koa-web的配置 app.use(KoaWeb({}));
// 参考: https://www.npmjs.com/package/koa-web
// 除 sessionKey 和 sessionMaxAge 外
web.config({
  path: __dirname,

  // cookie键名 默认: xweb
  // sessionKey: "xweb",
  // cookie过期时间， 默认 86400000 (一天)
  sessionMaxAge: 30000
});

// // 调用于: koa.use
// web.use(async (ctx, next) => {
//   await next();
//   ctx.body = 'fff';
// });

// 调用于: koa.listen
web.listen(3000, () => {
  console.log("server is running at http://localhost:3000");
});
```

#### session调用实例

```js
module.exports.html = async hd => {
  // 设置 session
  hd.ctx.session.say = 'hello';

  // 获取 session
  console.log(hd.ctx.session.say);
  
  return hd.ctx.session;
};

```