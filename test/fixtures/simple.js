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
    {
      name: 'Restful-用户文章列表',
      id: 'rest.user.posts',
      path: '/user/:id/posts',
    },
    {
      name: 'Restful-用户文章详情',
      id: 'rest.user.posts.detail',
      path: '/user/:uid/posts/:pid',
    },
  ],
};
