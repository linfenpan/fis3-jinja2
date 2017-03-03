'use strict';

const fis = require('fis3');
const JJ = require('../../index')(fis, {
  template: '/pat',
  static: '/htdocs',
  jinja2: '/run.py'
});

fis.match('/htdocs/**/(*.{js,css,less})', {
  useHash: true,
  // domain: 'http://cdn.cbg.163.com'
});

console.log(fis.project.currentMedia());

/************************* 下面这些内容，可以独立抽取为项目公用的配置 *************************/


// 如果不是开发环境，给后端同学的 map.json，不太符合后端同学的需要，所以重写一下
if (fis.project.currentMedia().indexOf('dev') !== 0) {
  fis.match('::package', {
    postpackager: function createMap(ret) {
      var path = require('path')
      var root = fis.project.getProjectPath();
      var map = fis.file.wrap(path.join(root, 'map.json'));

      // 其实用深复制就好了，不过没有引入相关的工具包
      var mapContent = Object.assign({}, ret.map);
      if (mapContent.res) {
        let res = Object.assign({}, mapContent.res);
        Object.keys(res).forEach(key => {
          let item = Object.assign({}, res[key]);
          item.uri = item.uri.replace(/htdocs\//, '');
          res[key] = item;
        });
        mapContent.res = res;
      }

      map.setContent(JSON.stringify(mapContent, null, map.optimizer ? null : 2));
      ret.pkg[map.subpath] = map;
    }
  });
}


// 拓展规则 JSON 和 FILE
const fs = require('fs-extra');
const path = require('path');
JJ.server.addCaptureRule('JSON', function(args) {
  const urlpath = args[0], filepath = args[1];
  const dirData = JJ.get('dirData');

  if (urlpath && filepath) {
    this.get(urlpath, (req, res, next) => {
      let filenameTarget = path.join(dirData, './' + filepath);
      if (fs.existsSync(filenameTarget)) {
        res.send(fs.readFileSync(filenameTarget).toString());
      } else {
        res.send('{}');
      }
    });
  }
});
JJ.server.addCaptureRule('FILE', function(args) {
  let urlpath = args[0], filepath = args[1];
  if (urlpath) {
    this.get(urlpath, (req, res, next) => {
      res.send('文件内容');
    });
  }
});
