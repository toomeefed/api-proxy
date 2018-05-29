import test from 'ava';
import Engine from '../lib/engine';

test('new Engine', (t) => {
  const engine = new Engine();
  t.true(engine.middleware.length === 0);
});

test('Engine#init', (t) => {
  class NewEngine extends Engine {
    init() {
      t.pass();
    }
  }
  const engine = new NewEngine();
  t.true(engine.middleware.length === 0);
});

test('Engine#use', (t) => {
  const engine = new Engine();
  engine.use(() => {});
  engine.use(() => {});
  t.true(engine.middleware.length === 2);
});

test('Engine#use throw Error', (t) => {
  t.throws(() => new Engine().use(1), TypeError);
});
