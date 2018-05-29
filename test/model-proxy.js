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
  t.deepEqual(body, { path: '/dev/home/index', query: {} });
});

test('ModelProxy fetch get', async (t) => {
  const model = new ModelProxy(simple);
  const { body } = await model.get('home.index');
  t.deepEqual(body, { path: '/dev/home/index', query: {} });
});

test('ModelProxy fetch post', async (t) => {
  const model = new ModelProxy(simple);
  const { body } = await model('user.create', { body: { name: 'admin' } });
  t.deepEqual(body, { name: 'admin' });
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
  t.deepEqual(body, { path: '/dev/home/index', query: {} });
});

test('ModelProxy#use throw', async (t) => {
  const model = new ModelProxy(simple);
  model.use(() => {
    throw Error('🦄');
  });
  const error = await t.throws(model('home.index'));
  t.is(error.message, '🦄');
});
