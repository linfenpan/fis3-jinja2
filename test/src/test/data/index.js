'use strict';
const Mock = require('lfp-mock-web');
const config = Mock.config;

var dataItem1 = {
  'url': 'http://xyq.cbg.163.com/cgi-bin/equipquery.py?act=buy_show_by_ordersn&server_id=69&ordersn=76_1437472190_76474340',
  'icon': 'http://res.xyq.cbg.163.com/images/big/2655.gif',
  'equip_name': '蝉翼金丝甲1',
  'area_name': '人族状元坊',
  'server_name': '广东一区',
  'highlights': null,
  'price': '162.00',
  'is_sold': false,
  'equip_level': '130',
  'add_melt_attrs': '防御 +3 速度 +80 气血 +23',

  'serverid': 69,
  'game_ordersn': '76_1437472190_76474340'
  // 'add_melt_attrs': '伤害+233 命中+321'
};
var dataItem2 = {
  'url': 'http://xyq.cbg.163.com/cgi-bin/equipquery.py?act=buy_show_by_ordersn&server_id=69&ordersn=76_1437472190_76474340',
  'icon': 'http://res.xyq.cbg.163.com/images/big/2655.gif',
  'equip_name': '蝉翼金丝甲2',
  'area_name': '魔族状元坊',
  'server_name': '广东一区',
  'highlights': [
    '初总伤767', '11锻', '力敏双加58', '初伤546'
  ],
  'price': '162.00',
  'is_sold': true,
  'equip_level': '130',
  'add_melt_attrs': '防御 +3 速度 +80 气血 +23',

  'serverid': 69,
  'game_ordersn': '76_1437472190_76474340'
  // 'add_melt_attrs': '伤害+233 命中+321'
};
var dataItem3 = {
  'url': 'http://xyq.cbg.163.com/cgi-bin/equipquery.py?act=buy_show_by_ordersn&server_id=69&ordersn=76_1437472190_76474340',
  'icon': 'http://res.xyq.cbg.163.com/images/big/2655.gif',
  'equip_name': '蝉翼金丝甲3',
  'area_name': '仙族状元坊',
  'server_name': '广东一区',
  'highlights': [
    '初总伤767'
  ],
  'price': '162.00',
  'is_sold': false,
  'equip_level': '130',
  'add_melt_attrs': '防御 +3 速度 +80',

  'serverid': 69,
  'game_ordersn': '76_1437472190_76474340'
  // 'add_melt_attrs': '伤害+233 命中+321'
};

module.exports = {
  'TopicId': '10',
  // 'TopicName': '不磨',
  'TemplateName': 'index.html',
  'TopicResUrl': `http://10.255.204.189:${config.PORT}/static`,
  // 网站静态资源引用
  'ResUrlVer': 'http://xyq.cbg.163.com',
  'data': [
    {
      'equip_list': [
        dataItem1, dataItem1, dataItem1, dataItem1, dataItem1, dataItem1, dataItem1, dataItem1, dataItem1, dataItem1
      ]
    },
    {
      'equip_list': [
        dataItem2, dataItem2, dataItem2, dataItem2, dataItem2, dataItem2, dataItem2, dataItem2, dataItem2, dataItem2
      ]
    },
    {
      'equip_list': [
        dataItem3, dataItem3, dataItem3, dataItem3, dataItem3, dataItem3, dataItem3, dataItem3, dataItem3, dataItem3
      ]
    },
  ]
};
