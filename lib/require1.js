'use strict';
const path = require('path');
const fs = require('fs-extra');

module.exports = function(name, dir) {
  if (dir) {
    name = path.resolve(dir, name);
  }

  // 没有后缀的，补充 .js
  if (!path.extname(name) && !fs.existsSync(name)) {
    name += '.js';
  }

  try {
    delete require.cache[require.resolve(name)];
  } catch (e) { }
  return require(name);
}
