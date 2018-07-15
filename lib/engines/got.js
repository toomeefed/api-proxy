const ms = require('ms');
const got = require('got');
const is = require('@sindresorhus/is');
const MaybeStore = require('@toomee/maybe-store');

const Engine = require('../engine');

// 默认字段特殊处理
const ignoreFields = ['id', 'name', 'engine', 'host', 'path', 'cache'];

/**
 * got 引擎
 */
class GotEngine extends Engine {
  constructor(opts = {}) {
    super();
    this.store = new MaybeStore(opts);
    this.cache();
    this.got();
  }

  cache() {
    this.use(async (ctx, next) => {
      const { store } = this;
      const { cache } = ctx.request || {};

      ctx.fromCache = false;

      let cacheTime;
      let cacheKey;

      // 缓存处理
      if (cache) {
        if (is.string(cache)) {
          // proxy('id', { cache: '2s' });
          cacheTime = ms(cache);
        } else if (is.number(cache)) {
          // proxy('id', { cache: 2000 });
          cacheTime = cache;
        } else {
          // proxy('id', { cache: { time: '2s' } });
          // proxy('id', { cache: { time: 2000 } });
          cacheTime = is.string(cache.time) ? ms(cache.time) : cache.time;
        }

        // proxy('id', {
        //   cache: {
        //     time: '2s',
        //     key(ctx) {
        //       return `${ctx.id}:${ctx.query.id}`; // 自定义 key
        //     },
        //   },
        // });
        cacheKey = is.function(cache.key) ? cache.key(ctx) : ctx.url; // 默认 key 为 url

        const body = await store.get(cacheKey);

        if (body) {
          ctx.body = body;
          ctx.fromCache = true;
          return;
        }
      }

      await next();

      if (cacheTime) {
        await store.set(cacheKey, ctx.body, cacheTime);
      }
    });
  }

  got() {
    this.use(async (ctx) => {
      const opts = Object.assign({}, ctx.request);

      // 删除保留字段
      ignoreFields.forEach((it) => {
        delete opts[it];
      });

      // got 参数 null 为 buffer
      if (opts.encoding === 'buffer') {
        opts.encoding = null;
      }

      // buffer 时关闭解析
      if (opts.encoding === null) {
        opts.json = false;
      }

      // 超时参数 ms 解析
      if (is.string(opts.timeout)) {
        opts.timeout = ms(opts.timeout);
      }

      // 为 stream 时特殊处理
      if (opts.stream) {
        opts.json = false;
        ctx.stream = got(ctx.url, opts);
        return;
      }

      ctx.response = await got(ctx.url, opts);
      ctx.body = ctx.response.body; // 挂载到跟对象，方便调用
    });
  }
}

module.exports = GotEngine;
