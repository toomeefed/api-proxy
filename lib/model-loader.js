/**
 * 模型加载器
 */
class ModelLoader {
  constructor(profiles) {
    this.models = new Map(); // 模型 map
    this.loadModel(profiles); // 加载配置
  }

  /**
   * 加载
   * @param {object} profiles 接口配置对象
   */
  loadModel(profiles) {
    // 基础信息
    this.title = profiles.title;
    this.version = profiles.version;
    this.hosts = profiles.hosts;

    // 保存原始数据
    this.profiles = profiles;

    // 默认配置
    const options = Object.assign(
      {
        engine: 'got', // 默认引擎
        decompress: false, // 默认不开 gzip
        json: true, // 默认解析 json
        timeout: 0, // 超时控制
      },
      profiles,
    );

    // 删除多余字段
    delete options.title;
    delete options.version;
    delete options.hosts;

    this.options = options;

    // 加载每个接口的配置
    profiles.interfaces.forEach((it, idx) => this.addModel(it, idx));
  }

  /**
   * 添加模型
   * @param {object} profile 接口配置
   * @param {number} idx 接口索引
   */
  addModel(profile, idx) {
    const { models, hosts, options } = this;
    const { id, name, path } = profile;

    if (!id) {
      throw new TypeError(`索引为 ${idx} 的接口未配置ID。`);
    }

    if (!path) {
      throw new TypeError(`接口 [${id}] 未配置 path 字段。`);
    }

    if (models.has(profile.id)) {
      throw new TypeError(`重复的接口 - { name: "${name}", id: "${id}" }`);
    }

    // 合并配置
    const opts = Object.assign({}, options, profile);

    if (!hosts[opts.host]) {
      throw new TypeError(`无效的 host - { name: "${name}", id: "${id}" }`);
    }

    // 修正 host 为真正地址
    opts.host = hosts[opts.host];

    // 拼接 url 得到完整地址
    opts.url = `${opts.host.replace(/\/$/, '')}/${profile.path.replace(/^\/(?!$)/, '')}`;

    models.set(id, opts);
  }

  /**
   * 获取模型
   * @param {string} id 接口id
   * @return {object} 接口配置
   */
  get(id) {
    return this.models.get(id);
  }

  /**
   * 是否有模型
   * @param {string} id 接口id
   * @return {boolean} 是否存在
   */
  has(id) {
    return this.models.has(id);
  }
}

module.exports = ModelLoader;
