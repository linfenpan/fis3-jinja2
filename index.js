'use strict';
const path = require('path');
const server = require('./lib/server/index');
const DataBus = require('./lib/util').dataBus;

module.exports = function fis3Jinja2(fis, options, serverConfig) {
  // 服务器配置
  serverConfig = Object.assign({
    open: fis.project.currentMedia() === 'dev',
    port: 8080
  }, serverConfig || {});

  // since fis3@3.3.21
  // 帮当前目录的查找提前在 global 查找的前面，同时又保证 local 的查找是优先的。
  if (fis.require.paths && fis.require.paths.length) {
    fis.require.paths.splice(1, 0, path.join(__dirname, 'node_modules'));
  }

  const sets = Object.assign({
    'namespace': '',
    'static': '/static',
    'template': '/template',
    'server': '/server.cf',
    'data': '/test',
    'jinja2': ''
  }, options || {});
  DataBus.set('fisOptions', sets);

  fis.util.map(sets, function(key, value) {
    fis.set(key, value);
  });

  const mapjsonName = fis.get('namespace') ? fis.get('namespace') + '-map.json' : 'map.json';

  const matchRules = {
    // 配置文件
    [sets.server]: {
      release: sets.server
    },
    [mapjsonName]: {
      release: `/${mapjsonName}`
    }
  };

  fis.util.map(matchRules, function(selector, rules) {
    fis.match(selector, rules);
  });

  // map.json
  fis.match('::package', {
    postpackager: function createMap(ret) {
      var path = require('path')
      var root = fis.project.getProjectPath();
      var map = fis.file.wrap(path.join(root, mapjsonName));
      map.setContent(JSON.stringify(ret.map, null, map.optimizer ? null : 2));
      ret.pkg[map.subpath] = map;
    }
  });

  let dirLocal = fis.project.getProjectPath();

  const fisOptions = fis.get('options');
  const dest = fisOptions.dest || fisOptions.d;
  let dirTarget = dest ? fis.project.getProjectPath(dest) : fis.project.getTempPath('www');

  // compile 每个文件都会触发，但是 release 仅在编译结束之后触发
  // release 在编译结束，会触发一次
  fis.once('release:end', function() {
    console.log('进入一次');
    process.nextTick(() => {
      if (serverConfig.open) {
        DataBus.set('dir', dirTarget);
        DataBus.set('dirData', path.resolve(dirTarget, './' + fis.get('data')));
        DataBus.set('dirStatic', path.resolve(dirTarget, './' + fis.get('static')));
        DataBus.set('dirTemplate', path.resolve(dirTarget, './' + fis.get('template')));
        DataBus.set('filepathServer', path.resolve(dirTarget, './' + sets.server));
        DataBus.set('filepathMap', path.resolve(dirTarget, mapjsonName));
        DataBus.set('portHttp', serverConfig.port);

        if (fis.get('jinja2')) {
          DataBus.set('filepathJinja2', path.resolve(dirTarget, './' + fis.get('jinja2')));
        }
        server.start();
      }

      // 重新加载
      fis.on('release:end', () => {
        server.reload();
      });
    });

  });

  return {
    server,
    set(key, value) {
      const protects = ['dir', 'dirData', 'dirStatic', 'dirTemplate', 'filepathServer', 'filepathMap', 'portHttp', 'filepathJinja2'];
      if (protects.indexOf(key) >= 0) {
        throw `${key} 是保护字段，不能被更改`;
      }
      return DataBus.set(key, value);
    },
    get(key, defaultValue) { return DataBus.get(key, defaultValue); }
  };
}
