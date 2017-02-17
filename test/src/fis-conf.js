'use strict';

const fis = require('fis3');
require('../../index')(fis, {
  template: 'pat',
  static: 'htdocs',
  jinja2: '/run.py'
});

fis.match('/htdocs/(*.{js,css,less})', {
  useHash: true,
  realse: '/$1'
});

console.log(fis.project.currentMedia());
