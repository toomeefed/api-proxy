import test from 'ava';
import ModelProxy from '../lib/model-proxy';

import { createServer } from './helpers/server';
import simple from './fixtures/simple';

let s;

test.before('setup', async () => {
  s = await createServer(true);

  s.on('*', (req, res) => {
    if (req.method === 'POST') {
      req.pipe(res);
    } else {
      res.end(JSON.stringify({
        method: req.method,
        path: req.pathname,
        query: req.query,
      }));
    }
  });

  await s.listen(s.port);

  simple.hosts.prod = simple.hosts.prod.replace('3000', s.port);
  simple.hosts.dev = simple.hosts.dev.replace('3000', s.port);
});

test.after('cleanup', async () => {
  await s.close();
});

test('new ModelProxy is function', (t) => {
  const model = new ModelProxy(simple);
  t.true(typeof model === 'function');
});

test('ModelProxy fetch', async (t) => {
  const model = new ModelProxy(simple);
  const { body } = await model('home.index');
  t.deepEqual(body, { method: 'GET', path: '/dev/home/index', query: {} });
});

test('ModelProxy fetch get', async (t) => {
  const model = new ModelProxy(simple);
  const { body } = await model.get('home.index');
  t.deepEqual(body, { method: 'GET', path: '/dev/home/index', query: {} });
});

test('ModelProxy fetch post', async (t) => {
  const model = new ModelProxy(simple);
  const { body } = await model('user.create', { body: { name: 'admin' } });
  t.deepEqual(body, { name: 'admin' });
});

test('ModelProxy fetch with params', async (t) => {
  const model = new ModelProxy(simple);
  const { body } = await model('rest.user.info', { params: { id: 1 } });
  t.deepEqual(body, { method: 'GET', path: '/dev/user/1', query: {} });
});

test('ModelProxy Restful', async (t) => {
  const model = new ModelProxy(simple);

  let data = await model('rest.user.info', { params: { id: 1 } });
  t.deepEqual(data.body, { method: 'GET', path: '/dev/user/1', query: {} });

  data = await model('rest.user.create', { body: { name: 'steve' } });
  t.deepEqual(data.body, { name: 'steve' });

  data = await model('rest.user.modify', { body: { id: 1 } });
  t.deepEqual(data.body, { method: 'PUT', path: '/dev/user', query: {} });

  data = await model('rest.user.del', { body: { id: 1 } });
  t.deepEqual(data.body, { method: 'DELETE', path: '/dev/user', query: {} });
});

test('ModelProxy Restful with params', async (t) => {
  const model = new ModelProxy(simple);
  const { body } = await model('rest.user.posts.detail', { params: { uid: 1, pid: 2 } });
  t.deepEqual(body, { method: 'GET', path: '/dev/user/1/posts/2', query: {} });
});

test('ModelProxy id not found', async (t) => {
  const model = new ModelProxy(simple);
  t.throws(() => model('myid'));
});

test('ModelProxy unknown engine', async (t) => {
  const model = new ModelProxy(simple);
  t.throws(() => model('home.index', { engine: 'unknown' }));
});

test('ModelProxy#use', async (t) => {
  t.plan(3);
  const model = new ModelProxy(simple);
  model.use(async (ctx, next) => {
    t.pass();
    await next();
    t.pass();
  });
  const { body } = await model('home.index');
  t.deepEqual(body, { method: 'GET', path: '/dev/home/index', query: {} });
});

test('ModelProxy#use throw', async (t) => {
  const model = new ModelProxy(simple);
  model.use(() => {
    throw Error('🦄');
  });
  const error = await t.throws(model('home.index'));
  t.is(error.message, '🦄');
});
