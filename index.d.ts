// Type definitions for ModelProxy 1.1.1
// Project https://github.com/toomeefed/api-proxy#readme
// TypeScript Version: 2.9

import got from 'got';
import { Middleware } from 'koa-compose';

declare namespace ModelProxy {
  /**
   * 请求方法
   */
  type Methods = 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete';

  interface IProfile {
    /**
     * 接口名
     */
    name: string;
    /**
     * 接口id (必须唯一)
     */
    id: string;
    /**
     * 接口地址
     */
    path: string;
    /**
     * 请求方法 (默认 GET)
     */
    method?: Methods;
    /**
     * 编码 (默认 utf8)
     */
    encoding?: string;
    /**
     * 超时控制 (支持ms格式)
     */
    timeout?: string | number;
  }

  interface IProfiles {
    /**
     * 项目名
     */
    title: string;
    /**
     * 版本
     */
    version: string;
    /**
     * 服务器环境 host 集合
     */
    hosts: {
      /**
       * 环境名: 地址
       */
      [env: string]: string;
    };
    /**
     * 默认服务器
     */
    host: string;
    /**
     * 是否 gzip 压缩
     */
    decompress?: boolean;
    /**
     * 是否解析 json
     */
    json?: boolean;
    /**
     * 接口列表
     */
    interfaces: IProfile[];
  }

  interface ICache {
    /**
     * 缓存时间
     */
    time: string | number;
    /**
     * 自定义缓存key
     * @param ctx 代理上下文对象
     */
    key(ctx: IContext): string;
  }

  interface IGotEngineContext {
    /**
     * 缓存时间
     */
    cache: string | number | ICache;
    /**
     * 是否命中缓存
     */
    fromCache: boolean;
    /**
     * 响应对象 (got返回)
     */
    response?: got.Response<object>;
    /**
     * 返回数据
     */
    body?: string | object;
    // stream?: object;
  }

  interface IRequest {
    /**
     * 是否解析 json
     */
    json?: boolean;
    /**
     * 请求参数
     */
    query?: string|object;
    /**
     * POST 参数
     */
    body?: string|object;
    /**
     * restful 参数
     */
    params?: object;
    /**
     * 引擎
     */
    engine?: string;
  }

  interface IContext extends IGotEngineContext {
    /**
     * 接口id
     */
    id: string;
    /**
     * 接口名
     */
    name: string;
    /**
     * 接口完整地址
     */
    url: string;
    /**
     * 接口模型配置
     */
    model: IProfile;
    /**
     * 配置参数
     */
    option: object;
    /**
     * 请求参数
     */
    request: IRequest;
  }

  interface IGotEngineOptions {
    /**
     * 编码
     */
    encoding?: string;
    /**
     * 请求参数
     */
    query?: string | object;
    /**
     * POST数据
     */
    body?: string | object;
    /**
     * 是否 gzip 压缩
     */
    decompress?: boolean;
    /**
     * 超时控制 (支持ms格式)
     */
    timeout?: string | number;
    /**
     * 缓存时间
     */
    cache?: string | number | ICache;
  }

  interface IEngine {
    /**
     * 添加中间件
     * @param middleware 中间件
     */
    use(middleware: Middleware<IContext>): void;
    /**
     * 添加引擎
     * @param name 引擎名
     * @param NewEngine 新引擎class
     */
    addEngine(name: string, NewEngine: IEngine): void;
  }

  interface IModelFn {
    /**
     * 请求方法
     * @param name 接口id
     * @param options 请求参数
     */
    (name: string, options?: IGotEngineOptions): Promise<IContext>;
  }

  type ModelFn = IModelFn &
    IEngine &
    Record<'get' | 'post' | 'put' | 'patch' | 'head' | 'delete', IModelFn>;

  interface IModelProxy {
    new (interfaces: IProfiles, option?: any): ModelFn;
  }
}

declare const ModelProxy: ModelProxy.IModelProxy;

export = ModelProxy;
