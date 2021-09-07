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

  hd.css("index.css");

  hd.view("path", hd.data.rootPath);
};

module.exports.css = hd => {
  return hd.read();
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
  hd.ctx.redirect('/');

  return "登录成功";
};

// 用户登出
module.exports.logout = async (hd, data) => {
  if (data.logout === 'true') {
    hd.ctx.session = null;
  }

  hd.ctx.status = 301;
  hd.ctx.redirect('/');
};