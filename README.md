# api-proxy

> node 前后端分离接口代理模块

  [![Travis](https://img.shields.io/travis/toomeefed/api-proxy.svg)](https://travis-ci.org/toomeefed/api-proxy)
  [![Coverage Status](https://img.shields.io/coveralls/toomeefed/api-proxy/master.svg?style=flat)](https://coveralls.io/github/toomeefed/api-proxy?branch=master)
  [![David](https://img.shields.io/david/toomeefed/api-proxy.svg)](https://david-dm.org/toomeefed/api-proxy)
  [![npm (scoped)](https://img.shields.io/npm/v/@toomee/api-proxy.svg)](https://www.npmjs.com/package/@toomee/api-proxy)
  [![node (scoped)](https://img.shields.io/node/v/@toomee/api-proxy.svg)](https://github.com/toomeefed/api-proxy)
  [![GitHub license](https://img.shields.io/github/license/toomeefed/api-proxy.svg)](https://github.com/toomeefed/api-proxy/blob/master/LICENSE)

为 node 前后端分离项目设计的现代化接口代理模块，以 koa 中间件方式处理接口请求，可以自由的在各个阶段对数据加工或日志记录。

## 安装

```sh
$ yarn add @toomee/api-proxy # 推荐
# 或者
$ npm i -S @toomee/api-proxy
```

## 使用

准备一份接口配置:

```js
// ./interfaces.js
module.exports = {
  title: 'simple',
  version: '1.0.0',
  hosts: {
    prod: 'http://localhost:3000/prod',
    dev: 'http://localhost:3000/dev',
  },
  host: 'dev',
  decompress: false,
  json: true,
  interfaces: [
    {
      name: '用户-列表',
      id: 'user.list',
      path: '/user/list',
    },
    {
      name: '用户-信息',
      id: 'user.info',
      path: '/user/info',
      host: 'prod',
    },
    {
      name: '用户-创建',
      id: 'user.create',
      method: 'post',
      path: '/user/create',
    },

    {
      name: 'Restful-用户信息',
      id: 'rest.user.info',
      path: '/user/:id',
    },
    {
      name: 'Restful-新增用户',
      id: 'rest.user.create',
      method: 'post',
      path: '/user',
    },
    {
      name: 'Restful-修改信息',
      id: 'rest.user.modify',
      method: 'put',
      path: '/user',
    },
    {
      name: 'Restful-删除用户',
      id: 'rest.user.del',
      method: 'delete',
      path: '/user',
    },
  ],
};
```

调用接口

```js
const ModelProxy = require('@toomee/api-proxy');
const interfaces = require('./interfaces');

const model = new ModelProxy(interfaces);

const { body } = await model('user.list');
// 或
const { body } = await model('user.create', { body: { name: 'steve' } });
// 或 restful
const { body } = await model('rest.user.info', { params: { id: 1 } });
```

## License

MIT
