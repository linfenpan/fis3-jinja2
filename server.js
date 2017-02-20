'use strict';

const ServerMiddleware = require('./lib/server-config-middleware');
const express = require('express');
const colors = require('colors');
const reload = require('reload');
const path = require('path');
const util = require('./lib/util');
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
  middleware: new ServerMiddleware(),
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
    this.middleware && this.middleware.updateByFile();
  },

  bindRouter() {
    app.use(
      '/static',
      express.static( DataBus.get('dirStatic', process.cwd()) )
    );

    // 注入自动重启的路由
    app.use('/', this.middleware.router);

    // 404
    app.use((req, res, next) => { res.send(404, '404'); });

    this.bindRouter = util.noop;
  },

  addCaptureRule(type, fn) {
    if (this.middleware) {
      this.middleware.addCaptureRule(type, fn);
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
