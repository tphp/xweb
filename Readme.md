#### 使用说明

- 使用基本步骤请参考: [koa-web](https://www.npmjs.com/package/koa-web)
- 新增session的支持，[koa-session](https://www.npmjs.com/package/koa-session) 数据保存到根目录的.cache中
- koa-session默认保存到cookie中，这种情况并不安全
- 但koa-session也提供了数据保存接口，xweb简单的封装了下
- xweb启动时将自动清理过期的session数据文件

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
  // session 将保存到 __dirname/.cache中
  path: __dirname,

  // cookie键名 默认: xweb
  // sessionKey: "xweb",
  
  // cookie过期时间， 默认 86400000 (一天)
  // sessionMaxAge: 86400000
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

---

## session调用实例

#### 创建html页面: /html/session/login.html
```html
<html>
<head>
  <title>{% if login %}欢迎: {{ username }}{% else %}登录测试{% endif %}</title>
</head>
<body>
{% if login %}
  <div>欢迎: {{ username }}</div>
  <form action="login.loginout" method="post">
    <div><input type="hidden" name="loginout" value="true"></div>
    <div><input type="submit" value="退出"></div>
  </form>
{% else %}
  <form action="login.login" method="post">
    <div><input type="text" name="username"></div>
    <div><input type="text" name="password"></div>
    <div><input type="submit" value="登录"></div>
  </form>
{% endif %}
</body>
</html>
```

#### 创建数据控制页面: /html/session/login.js

```js
// html登录页面
module.exports.html = async hd => {
  if (hd.ctx.session.login) {
    hd.view({
      login: hd.ctx.session.login,
      username: hd.ctx.session.username
    });
  } else {
    hd.view({
      login: false
    });
  }
};

// 用户登录 账号: admin 密码: admin
module.exports.login = async (hd, data) => {
  if (!hd.isPost()) {
    return "数据提交错误!";
  }

  let username = data.username;
  let password = data.password;

  if (username !== 'admin' || password !== 'admin') {
    return "登录失败";
  }

  hd.ctx.session.login = true;
  hd.ctx.session.username = username;

  hd.ctx.status = 301;
  hd.ctx.redirect('/session/login');

  return "登录成功";
};

// 用户登出
module.exports.loginout = async (hd, data) => {
  if (data.loginout === 'true') {
    hd.ctx.session = null;
  }

  hd.ctx.status = 301;
  hd.ctx.redirect('/session/login');
};
```

- 访问: http://localhost:3000/session/login