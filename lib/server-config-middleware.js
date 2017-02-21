'use strict';
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');
const DataBus = util.dataBus;
const RouterMatcher = require('./router-matcher');
const Jinja2Tmeplate = require('./jinja2-template');

require('colors');

class Middleware extends RouterMatcher {
  constructor() {
    super();
    this.captureRules = {};
    this.initDefaultCaptureRule();
  }

  // 根据配置文件，设置如有
  updateByFile() {

    const filepath = DataBus.get('filepathServer');

    if (!fs.existsSync(filepath)) {
      return this;
    }

    this.clearRules();
    const lines = util.readFileLines(filepath);
    const rules = this.captureRules;

    lines.forEach(function(line) {
      line = line.trim();
      if (!line || line.indexOf('#') === 0) { return; }

      let args = line.split(/\s+/);
      let key = (args.shift() || '').toLowerCase();

      if (rules[key]) {
        rules[key].call(this, args);
      } else {
        console.warn(`缺少捕获规则: ${key}`.red);
      }
    }.bind(this));
  }

  // 添加配置文件的捕获规则
  addCaptureRule(type, fn) {
    if (typeof fn !== 'function') {
      throw '捕获规则，第二个参数，必须是函数';
    }
    this.captureRules[type.toLowerCase()] = fn;
    return this;
  }

  initDefaultCaptureRule() {
    ['GET', 'POST', 'ALL'].forEach(KEY => {
      this.addCaptureRule(KEY, (args) => {
        if (args.length < 2) {
          return console.warn(`方法"${KEY}"至少2个参数: ${KEY} ${args.join(' ')}`.red);
        }
        const dir = DataBus.get('dir', process.cwd());
        const urlpath = args[0],
          templateName = args[1],
          dataFilepath = args[2] ?
            path.join(DataBus.get('dirData', dir), './' + args[2]) :
            path.join(DataBus.get('dirData', dir), './' + path.basename(templateName, path.extname(templateName)) + '.js');
        const extname = path.extname(dataFilepath).toLowerCase();
        const build = function(req, res, data) {
          this.buildJinja2(templateName, data)
            .then(html => res.send(html))
            .catch(error => res.send(html));
        }.bind(this);

        this.get(urlpath, (req, res, next) => {
          console.log('读取文件:' + dataFilepath);
          // TODO 这个逻辑，缺乏测试..
          if (fs.existsSync(dataFilepath)) {
            const result = util.mockData(dataFilepath);
            const type = typeof result;
            switch (type) {
              case 'function':
                result(build.bind(this, req, res), req, res, next);
                break;
              case 'object':
                build(req, res, result);
                break;
              default:
                // 读取文件
                res.send(this.readFileByName(templateName));
            }
          } else {
            // 读取文件
            res.send(this.readFileByName(templateName));
          }
        });
      });
    });
  }

  readFileByName(name) {
    const dir = DataBus.get('dir', process.cwd());
    const dirTempate = DataBus.get('dirTemplate', dir);
    const filepath = path.join(dirTempate, './' + name);

    let content = '';
    if (fs.existsSync(filepath)) {
      content = fs.readFileSync(filepath).toString();
    }
    return content;
  }

  buildJinja2(templateName, data) {
    const dir = DataBus.get('dir', process.cwd());
    const dirTempate = DataBus.get('dirTemplate', dir);
    const filepathJinja2 = DataBus.get('filepathJinja2');

    let template = new Jinja2Tmeplate(dirTempate, filepathJinja2);
    return template.render(templateName, data);
  }
}

module.exports = Middleware;
