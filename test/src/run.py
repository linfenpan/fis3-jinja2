#!/user/bin/env python
# coding: utf-8

# 其中 ${xxx} 部分均会被 node.js 替换 paths -> 模板的绝对路径, dataFilepath -> 临时数据文件, nameTemplate -> 当前渲染的模板名字

import json
from jinja2 import Environment, FileSystemLoader
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

paths = ${paths};
env = Environment(
    loader = FileSystemLoader(paths, encoding = 'utf-8'),
    cache_size = -1,
    autoescape = True,
    extensions = ['jinja2.ext.do', 'jinja2.ext.with_']
)

dataStr = '{}'
file_object = open(${dataFilepath}, 'r')
try:
     dataStr = file_object.read()
finally:
     file_object.close()
data = json.loads(dataStr)

template = env.get_template('${nameTemplate}')

# 模板绑定部分，与 node.js 通讯，请保持 print 的输出
def __render(tmp, map):
    print 'START=============@@@=============START'
    print tmp.render(**map)
    print 'END=============@@@=============END'
__render(template, data)
