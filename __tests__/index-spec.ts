import * as index from '../src/index';

test('Should have Wechat available', () => {
  expect(index.Wechatpay).toBeTruthy();
});
