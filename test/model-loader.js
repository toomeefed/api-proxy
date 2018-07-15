import test from 'ava';
import ModelLoader from '../lib/model-loader';

import simple from './fixtures/simple';

const profiles = {
  title: 'simple',
  version: '1.0.0',
  hosts: {
    prod: 'http://localhost/prod',
    dev: 'http://localhost/dev',
  },
  host: 'dev',
  interfaces: [],
};

test('new ModelLoader', (t) => {
  const model = new ModelLoader(simple);
  t.true(model.title === simple.title);
});

test('ModelLoader#get', (t) => {
  const models = new ModelLoader(simple);
  models.has('user.info');
  const model = models.get('user.info');
  t.true(model.url === model.host + model.path);
});

test('ModelLoader throw Error', (t) => {
  profiles.interfaces = [{}];
  t.throws(() => new ModelLoader(profiles), TypeError);
  profiles.interfaces = [{ id: 'a' }];
  t.throws(() => new ModelLoader(profiles), TypeError);
  profiles.interfaces = [{ id: 'a', path: '/' }, { id: 'a', path: '/' }];
  t.throws(() => new ModelLoader(profiles), TypeError);
  profiles.interfaces = [{ id: 'a', path: '/', host: 'unknown' }];
  t.throws(() => new ModelLoader(profiles), TypeError);
});
