# fis3-jinja2

如题所示，使用 fis3，与 python 的 jinja2 框架，模拟站点运行。
因为不怎么了解 fis3 的服务器开发，所以把 express 内置在代码包中，充当服务器。

如果有熟悉的同学，恳请指点

# 使用

**确保本机已经安装了 python 以及 jinja2**

参考了 fis3-smarty 的设计，只需要在 fis-config.js 中，引入 ```fis3-jinja2``` 代码包，添加参数配置，即可

```javascript
  const fisJ = require('fis3-jinja2')(fis, {
    'namespace': '', // 目标目录，生成 map.json 的前缀名字
    'static': '/static', // fis3 release 后，静态资源目录，用于初始化 express 的静态资源访问路径，所有需要静态访问的资源，都应该放于此目录
    'template': '/template', // fis3 release 后，jinja2 模板所在的目录
    'server': '/server.cf', // fis3 release 后，jinja2 的服务器配置文件
    'data': '/test', // fis3 release 后，jinja2 读取模拟数据的目录
    'jinja2': ''  // fi3 release 后，jinja2 读取渲染模板的 .py 文件，如果没有设置，会使用默认的渲染文件
  }, {
    port: 8080, // express 的端口号
    open: fis.project.currentMedia() === 'dev' // 是否启动 express
  });

  // 接下来就是项目自己的配置
```
以上，就已经是 fis3-jinja2 配置的全部内容了。


# 关于 server.cf 的配置

看下面代码:
```text
# 注释，以井号开始

# GET 方式，访问 http://localhost:8080/，使用模板目录的 /index.html，使用数据目录的 /index.js 进行渲染，如果 /index.js 不存在，则不进行 jinja2 的渲染
GET / /index.html
# GET 方式，访问 http://localhost:8080/child，使用模板目录的 /second/child.html，使用数据目录的 /second/child.js 进行渲染，如果 /second/child.js 不存在，则不进行 jinja2 的渲染
GET /child /second/child.html

# GET 方式，访问 http://localhost:8080/index2 使用模板目录的 /index.html 文件，使用数据目录的 /data/index2.js 进行渲染
GET /index2 /index.html /data/index2.js

# GET 方式，访问 http://localhost:8080/index3 使用模板目录的 /index.html 文件，使用数据目录的 /data/index3.json 进行渲染
GET /index3 /index.html /data/index3.json
```

内置了三种访问方式: GET，POST，ALL。

如果三种方式，无法满足需求，可以在 fis-config.js 中，进行拓展:
```javascript
const fs = require('fs-extra');
const path = require('path');
fisJ.server.addCaptureRule('JSON', function(args) {
  // 在 server.cf 中，使用方式: JSON /data /json/data.json
  // args = [ '/data', '/json/data.json' ]
  const urlpath = args[0], filepath = args[1];
  // 取得当前数据目录
  const dirData = fisJ.get('dirData');

  if (urlpath && filepath) {
    // this = /lib/server/router/matcher.js
    // 拥有 .get/.post/.all 常用方法，用来给当前路由器，动态添加捕获规则，与 express 的写法一致
    // 上面的3个方法，是 .addRule(method, urlpath, callback) 的语法糖，需要支持更多的方法，可以使用该函数
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
```
配置完成后，可以试试访问 ```http://localhost:8080/data``` 查看效果了。


## 关于 fis3-jinja2 的方法

```javascript
const fisJ = require('fis3-jinja2')(fis, {...});
```
fisJ 对方暴露了以下几个方法:

  * .get(key, defaultValue) 获取当前设置的某个值，如果此值不存在，返回 defaultValue
  * .set(key, value) 给 fisJ 数据总线中，设置某个值，可通过 .get 重新获取
  * .server 对象，express 的服务器对象，如果服务器没开启，使用该对象的方法，可能会出问题。所以使用前，请检查服务器是否已经开启
    * .addCaptureRule(type, fn) 添加服务器捕获规则
    * .reload() 刷新页面
    * .start() 启动服务器，如果在初始化时，已经设置自动开启服务器，那么禁止重复调用
    * .updateRouter() 更新配置文件，已经集成在 .reload() 的逻辑中，一般不需要自己调用


## 数据模拟文件

数据文件，默认支持 .js 和 .json 两种形式。

对应 .js 文件，必须返回可运行的函数，或者 json 形式的数据。

例如:
```javascript
  module.exports = { title: '测试' };
```
又或者:
```javascript
  module.exports = function(done, req, res, next) {
    // 如果调用了 next，代表不处理本次请求，抛给 express 的下一个中间件处理
    // 如果 调用了 done，则需要保证不调用 next
    done({
      title: '测试'
    });
  };
```


# 测试

进入 test/src 目录，运行命令: ```fis3 release -d ../dest -w```

访问浏览器: http://localhost:8080 查看效果
