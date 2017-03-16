'use strict';

const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs-extra');

class Template {
  // @param {String} [dir] jinja2临时运行目录
  // @param {String} [dirTempate] 模板文件所在目录
  // @param {String} [jinja2Filepath] jinja2 运行文件的真实路径
  constructor(dir, dirTempate, jinja2Filepath) {
    this.dir = dir || process.cwd();
    this.dirTempate = dirTempate || this.dir;
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
      const tmpDir = this.dir;
      const runFilepath = path.join(tmpDir, './.run.py');
      const dataFilepath = path.join(tmpDir, './.data.json');
      fs.ensureFileSync(runFilepath);
      fs.ensureFileSync(dataFilepath);

      const fileTempateStr = fs.readFileSync(this.pythonFilepath).toString();
      const fileTempateOpts = {
        paths: JSON.stringify([this.dirTempate]),
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
        fs.removeSync(runFilepath);
        fs.removeSync(dataFilepath);
      });
    });
  }
}

module.exports = Template;
