'use strict';

const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs-extra');

class Template {
  constructor(dir, jinja2Filepath) {
    this.dir = dir || process.cwd();
    this.pythonFilepath = jinja2Filepath || path.resolve(__dirname, '../.python/jinja2.py');
  }

  render(templateFilePath, data) {
    return new Promise((resolve, reject) => {
      resolve(this.buid(templateFilePath, data));
    });
  }

  // 生成临时文件，并且运行
  buid(nameTemplate, data) {
    return new Promise((resolve, reject) => {
      const tmpDir = path.join(this.dir, './.python');
      const runFilepath = path.join(tmpDir, './.python/run.py');
      const dataFilepath = path.join(tmpDir, './.python/data.json');
      fs.ensureFileSync(runFilepath);
      fs.ensureFileSync(dataFilepath);

      const fileTempateStr = fs.readFileSync(this.pythonFilepath).toString();
      const fileTempateOpts = {
        paths: JSON.stringify([this.dir]),
        nameTemplate: nameTemplate,
        dataFilepath: JSON.stringify(dataFilepath)
      };

      fs.writeFileSync(dataFilepath, JSON.stringify(data, null, 2));
      fs.writeFileSync(runFilepath, fileTempateStr.replace(/\${([^}]+)}/g, (str, key) => {
        return fileTempateOpts[key] || '${'+ key +'}';
      }));

      exec(`python ${runFilepath}`, (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        } else {
          resolve(stdout.replace(/(START)(=+)(@+)\2\1([\s\S]*)(END)\2\3\2\5/g, '$4'));
        }
        fs.removeSync(tmpDir);
      });
    });
  }
}

module.exports = Template;
