import test from 'ava';
import delay from 'delay';
import compose from 'koa-compose';
import GotEngine from '../../lib/engines/got';
import { createServer } from '../helpers/server';

let s;

test.before('setup', async () => {
  s = await createServer();

  s.on('/', (req, res) => {
    res.end('ok');
  });

  s.on('/post', (req, res) => {
    req.pipe(res);
  });

  s.on('/buffer', (req, res) => {
    res.end('buffer');
  });

  await s.listen(s.port);
});

test.after('cleanup', async () => {
  await s.close();
});

test('new GotEngine', (t) => {
  const engine = new GotEngine();
  t.true(engine.middleware.length === 2);
});

test('GotEngine get', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { url: s.url };
  await fn(ctx);
  t.is(ctx.body, 'ok');
});

test('GotEngine post', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { url: `${s.url}/post`, req: { body: { a: 1, b: 2 }, json: true } };
  await fn(ctx);
  t.deepEqual(ctx.body, { a: 1, b: 2 });
});

test('GotEngine buffer', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { url: `${s.url}/buffer`, req: { encoding: 'buffer' } };
  await fn(ctx);
  t.true(ctx.body.toString('utf8') === 'buffer');
});

test('GotEngine stream', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { url: `${s.url}/buffer`, req: { stream: true } };
  fn(ctx);
  const data = await new Promise((resolve) => {
    ctx.stream.on('data', (chunk) => {
      resolve(chunk.toString());
    });
  });
  t.true(data === 'buffer');
});

test('GotEngine cache 2s', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { url: s.url, req: { cache: '2s' } };

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.true(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');
});

test('GotEngine cache 2000', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { url: s.url, req: { cache: 2000 } };

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.true(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');
});

test('GotEngine cache.time', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { url: s.url, req: { cache: { time: '2s' } } };

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.true(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');
});

test('GotEngine cache.key', async (t) => {
  const engine = new GotEngine();
  const fn = compose(engine.middleware);
  const ctx = { id: 'home', url: s.url, req: { cache: { time: 2000, key: ({ id }) => id } } };

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.true(ctx.fromCache);
  t.is(ctx.body, 'ok');

  await delay(1500);

  await fn(ctx);
  t.false(ctx.fromCache);
  t.is(ctx.body, 'ok');
});
