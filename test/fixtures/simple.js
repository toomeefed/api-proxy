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
      name: '首页',
      id: 'home.index',
      path: '/home/index',
    },
    {
      name: '首页-banner',
      id: 'home.banner',
      path: '/home/banner',
    },

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
  ],
};
