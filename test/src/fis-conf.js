'use strict';

const fis = require('fis3');
fis.hook('commonjs');

const JJ = require('../../index')(fis, {
  template: '/pat',
  static: '/htdocs',
  jinja2: '/run.py'
});

fis.match('/htdocs/**/(*.{js,css,less})', {
  useHash: true,
  isMod: true,
  // domain: 'http://cdn.cbg.163.com'
});

fis.match('/htdocs/js/{base,native_call}.js', {
  packTo: '/htdocs/js/lib.js'
});

fis.match('/htdocs/**/mod.js', {
  isMod: false
});


/************************* 下面这些内容，可以独立抽取为项目公用的配置 *************************/

// 如果不是开发环境，给后端同学的 map.json，不太符合后端同学的需要，所以重写一下
const deepAssign = require('deep-assign');
fis.match('::package', {
  postpackager: function createMap(ret) {
    var path = require('path')
    var root = fis.project.getProjectPath();
    var map = fis.file.wrap(path.join(root, 'map.json'));
    var result = deepAssign({}, ret.map);

    // 存在 pkg，修正 map 的 res 各个属性
    var res = result.res, pkg = result.pkg;
    Object.keys(res).forEach(key => {
      let item = res[key];
      if (item.pkg && pkg[item.pkg]) {
        item.uri = pkg[item.pkg].uri;
      }
      Object.keys(item).forEach(k => {
        if (['uri', 'deps', 'type'].indexOf(k) < 0) {
          delete item[k];
        }
      });
    });
    delete result.pkg;


    // 其实用深复制就好了，不过没有引入相关的工具包
    if (fis.project.currentMedia().indexOf('dev') !== 0) {
      if (result.res) {
        res = Object.assign({}, result.res);
        Object.keys(res).forEach(key => {
          item.uri = item.uri.replace(/htdocs\//, '');
        });
      }
    }

    map.setContent(JSON.stringify(result, null, map.optimizer ? null : 2));
    ret.pkg[map.subpath] = map;
  }
});


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
