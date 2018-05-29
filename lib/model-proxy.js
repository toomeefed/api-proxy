const compose = require('koa-compose');

const ModelLoader = require('./model-loader');
const engineGot = require('./engines/got');
const Engine = require('./engine');

class ModelProxy extends Engine {
  constructor(interfaces, option = {}) {
    super(); // 集成中间件功能
    this.option = option;
    this.models = new ModelLoader(interfaces); // 加载配置为模型

    this.engines = new Map(); // 引擎对象
    this.addEngine('got', engineGot); // 添加引擎

    // 封装 代理器
    const proxy = (id, opts) => {
      const { models, engines } = this;

      if (!models.has(id)) {
        throw Error(`没有ID为 ${id} 的接口！`);
      }

      const model = models.get(id); // 获取对应模型
      const req = Object.assign({}, model, opts); // 请求对象

      if (!engines.has(req.engine)) {
        throw Error(`没有发现 ${req.engine} 引擎！`);
      }

      const engine = engines.get(req.engine); // 获取引擎

      const { name, url } = model;
      const ctx = { id, name, url, model, req, option }; // 上下文对象

      // 组合中间件
      const stack = compose(this.middleware.concat(engine.middleware));

      // 执行中间件
      return stack(ctx)
        .then(() => ctx)
        .catch((err) => {
          err.ctx = ctx;
          return Promise.reject(err);
        });
    };

    // 添加 restful 方法
    const methods = ['get', 'post', 'put', 'patch', 'head', 'delete'];
    methods.forEach((method) => {
      proxy[method] = (url, opts) => proxy(url, Object.assign({}, opts, { method }));
    });

    // 绑定实例方法
    proxy.addEngine = this.addEngine.bind(this);
    proxy.use = this.use.bind(this);

    return proxy;
  }

  /**
   * 添加引擎
   * @param {string} name 引擎名
   * @param {object} NewEngine 引擎类
   */
  addEngine(name, NewEngine) {
    this.engines.set(name, new NewEngine(this.option));
  }
}

// 导出公共类
ModelProxy.ModelProxy = ModelProxy;
ModelProxy.Engine = Engine;
module.exports = ModelProxy;
