'use strict';

const fis = require('fis3');
const JJ = require('../../index')(fis, {
  template: 'pat',
  static: 'htdocs',
  jinja2: '/run.py'
});

fis.match('/htdocs/**/(*.{js,css,less})', {
  useHash: true
});


// 拓展规则
const fs = require('fs-extra');
const path = require('path');
JJ.server.addCaptureRule('JSON', function(args) {
  const urlpath = args[0], filepath = args[1];
  const dirData = JJ.get('dir');

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

console.log(fis.project.currentMedia());
