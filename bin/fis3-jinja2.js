#!/usr/bin/env node
// vi foo/bin/foo.js
var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var cli = new Liftoff({
  name: 'fis3-jinja2', // 命令名字
  processTitle: 'fis3-jinja2',
  moduleName: 'fis3-jinja2',
  configName: 'fis-conf',

  // only js supported!
  extensions: {
    '.js': null
  }
});

cli.launch({
  cwd: argv.r || argv.root,
  configPath: argv.f || argv.file
}, function(env) {
  var fis;
  if (!env.modulePath) {
    fis = require('../');
  } else {
    fis = require(env.modulePath);
  }
  fis.set('fis.require.paths', [env.cwd, __dirname]);
  fis.cli.run(argv, env);
});
