'use strict';
const fs = require('fs-extra');
const path = require('path');
const require1 = require('./require1');

module.exports = {
  noop() { },

  // @return 每一行的字符串
  readFileLines(filepath) {
    let result = [];
    if (fs.existsSync(filepath)) {
      result = fs.readFileSync(filepath).toString().split(/\n\r?|\r\n?/g);
    }
    return result;
  },

  // 数据总线
  dataBus: (function() {
    const map = {};
    return {
      get(key, def) { let value = map[key]; return value === void 0 ? def : value; },
      set(key, value) { map[key] = value; return this; },
      remove(key) { delete map[key]; return this; }
    };
  })(),

  // 获取数据
  // @param {String} [filepath] 文件的绝对路径
  mockData(filepath) {
    if (fs.existsSync(filepath)) {
      return require1(filepath, process.cwd());
    } else {
      console.warn(`数据文件不存在: ${filepath}`.red);
      return {};
    }
  }
};
