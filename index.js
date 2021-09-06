'use strict';

const fs = require("fs");
const Koa = require("koa");
const KoaWeb = require("koa-web");
const KoaSession = require("koa-session");
const crypto = require('crypto');

const app = new Koa();

module.exports = class Xweb {
  static __config;

  /**
   * 配置设置
   * @param {*} config 
   * @returns 
   */
  config (config) {
    if (config === undefined || config.constructor.name !== 'Object') {
      return;
    }

    this.__config = config;
  }

  /**
   * 创建文件夹
   * @param {*} path 
   * @returns 
   */
  mkdir (path = '') {
    path = path.replace(/[\\]/g, "/");
    let pos = path.lastIndexOf("/");
    if (pos >= 0) {
      path = path.substring(0, pos);
    }

    let pathTmp = "";
    let pathList = path.split("/");
    try {
      for (const i in pathList) {
        pathTmp += "/" + pathList[i];
        if (fs.existsSync(pathTmp)) {
          if (fs.statSync(pathTmp).isFile()) {
            return false;
          }
        } else {
          fs.mkdirSync(pathTmp);
        }
      }
    } catch (e) {
      return false;
    }

    return true;
  }

  /**
   * 读取文件
   * @param {*} jsonFile 
   * @param {*} maxAge 
   * @returns 
   */
  read (jsonFile = '', maxAge = 0) {
    if (!fs.existsSync(jsonFile) || !fs.statSync(jsonFile).isFile()) {
      return {};
    }

    const statSync = fs.statSync(jsonFile);
    const age = (new Date()).getTime() - parseInt(statSync.mtimeMs);

    try {
      if (age > maxAge) {
        fs.unlinkSync(jsonFile);
        return {};
      }

      return JSON.parse(fs.readFileSync(jsonFile).toString());
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  /**
   * 获取键值
   * @param {*} sessionId 
   * @returns 
   */
  getKey(sessionId) {
    const md5 = crypto.createHash('md5').update(sessionId).digest("hex");
    return md5.substring(0, 2) + "/" +  md5.substring(2, 16) + ".json";
  }

  /**
   * 清理文件夹过期的cookie文件
   * @param {*} path 
   * @param {*} maxAge 
   */
  clearKeys(path = '', maxAge = 0) {
    fs.readdir(path, function (err, files) {
      if (err) {
        return '目录不存在';
      }

      for (const i in files) {
        let tPath = path + "/" + files[i];
        if (!fs.statSync(tPath).isDirectory()) {
          continue;
        }

        fs.readdir(tPath, function (e, _fs) {
          if (e) {
            return '目录不存在';
          }

          let delCot = 0;
          let fCounts = _fs.length;
          for (const j in _fs) {
            let jvPath = tPath + "/" + _fs[j];
            const statSync = fs.statSync(jvPath);
            const age = (new Date()).getTime() - parseInt(statSync.mtimeMs);
            if (age > maxAge) {
              delCot ++;
              fs.unlinkSync(jvPath);
            }
          }

          if (delCot >= fCounts) {
            fs.rmdirSync(tPath);
          }
        });
      }
    })
  }

  /**
   * Koa应用
   * @param {*} func 
   */
  use (func) {
    app.use(func);
  }

  /**
   * 初始化
   */
  init () {
    app.keys = ['xweb'];
    let sKey = this.__config.sessionKey;
    let sMaxAge = this.__config.sessionMaxAge;
    let config = {
      key: 'xweb',
      renew: true,
    };

    if (sKey !== undefined && typeof sKey === 'string') {
      config['key'] = sKey;
    }

    if (sMaxAge !== undefined && typeof sMaxAge === 'number') {
      config['maxAge'] = parseInt(sMaxAge);
    } else {
      sMaxAge = 86400000;
      config['maxAge'] = sMaxAge;
    }

    if (this.__config !== undefined) {
      let path = this.__config.path;
      if (typeof path === 'string') {
        path = path.trim();
        let pathLast = path[path.length - 1];
        if (pathLast !== '\\' && pathLast !== '/') {
          path += "/";
        }

        const cachePath = path + ".cache/";

        this.clearKeys(cachePath, sMaxAge);

        config['store'] = {
          // 获取 session 数据
          get: (key, maxAge) => {
            return this.read(cachePath + this.getKey(key), maxAge);
          },

          // 设置 session 数据
          set: (key, sess) => {
            const jsonFile = cachePath + this.getKey(key);
            if (this.mkdir(jsonFile)) {
              fs.writeFileSync(jsonFile, JSON.stringify(sess));
            }
          },

          // 销毁 session 数据
          destroy: (key) => {}
        };
      }
    }

    app.use(KoaSession(config, app));
  }

  /**
   * 页面监听
   * @param {*} port 
   * @param {*} func 
   */
  listen (port, func) {
    this.init();

    if (this.__config !== undefined) {
      app.use(KoaWeb(this.__config));
    }
    app.listen(port, func);
  }
};