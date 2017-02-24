'use strict';

const RouterDynamic = require('./router/dynamic');
const express = require('express');
const colors = require('colors');
const reload = require('reload');
const path = require('path');
const util = require('../util');
const app = express();
const fs = require('fs');

const DataBus = util.dataBus;
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


module.exports = {
  server: null,
  reloader: null,
  // 动态路由
  routerDynamic: new RouterDynamic(),
  dataBus: DataBus,

  start() {
    if (!this.server) {
      this.bindRouter();
      this.server = app.listen(DataBus.get('portHttp', 8080), () => {
        const port = this.server.address().port;
        console.log(`正在监听端口: ${port}`.green);
      }.bind(this));

      this.reloader = reload(this.server, app);
    }
    // 更新服务器配置文件
    this.routerDynamic && this.routerDynamic.updateByFile();
  },

  bindRouter() {
    const fisOptions = DataBus.get('fisOptions', {});
    const dirStatic = DataBus.get('dirStatic', process.cwd());

    // 静态资源
    app.use(
      fisOptions.static.indexOf('/') === 0 ? fisOptions.static : '/' + fisOptions.static,
      express.static( dirStatic )
    );

    // 使用注入中间键，在 head 标签前，插入socket脚本
    app.use(require('./middleware/inject')({
      injects: [
        ['<head>', '<script src="/.public/reload.js"></script>', 'after']
      ]
    }));
    app.get('/.public/reload.js', (req, res) => {
      const content = fs.readFileSync(path.resolve(__dirname, '../../.public/reload.js')).toString();
      res.set('content-type', 'text/javascript');
      res.send(content);
    });

    // 注入自动重启的路由
    app.use('/', this.routerDynamic.router);

    // 404
    app.use((req, res, next) => { res.status(404).send('<html><head><title>404</title></head><body>404</body></html>'); });

    this.bindRouter = util.noop;
  },

  addCaptureRule(type, fn) {
    if (this.routerDynamic) {
      this.routerDynamic.addCaptureRule(type, fn);
    } else {
      throw '路由中间键，没有初始化';
    }
    return this;
  },

  // 刷新页面
  reload: (function() {
    let timer;
    function reloadWeb(reloader) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // 刷新太快, ws 会挂掉~
        try {
          reloader.reload();
        } catch(e) {
          console.log('* ignore reload *');
        }
      }, 30);
    }

    return function() {
      let reloader = this.reloader;
      if (!reloader) {
        return;
      }
      reloadWeb(reloader);
    };
  })()
};
