import { IConfig, IOrder , IOrderParams, Wechatpay } from '../src/wechatpay';
import { readFileSync } from 'fs';
import { resolve } from 'path';

test('Should greet with message', async () => {
  const config: IConfig = {
    appid: 'wxd457bea6a1506dc5',
    mch_id: '1486513462',
    apiKey: '80Adxl69yfEMzlZ5WSAnG4jAtXs5yITm', //微信商户平台API密钥
    notify_url: `http://example.com`,
    trade_type: 'APP', //APP, JSAPI, NATIVE etc.
    pfx: readFileSync(resolve('./apiclient_cert.p12')),
  };
  const wechatpay = new Wechatpay(config);
  const orderParams: IOrderParams = {
    body: '支付测试', // 商品或支付单简要描述
    out_trade_no: 'order1', // 商户系统内部的订单号,32个字符内、可包含字母
    total_fee: 100,
    spbill_create_ip: '192.168.2.1',
    notify_url: 'http://wxpayment_notify_url',
    trade_type: 'APP',
  };
  const IOrders :IOrder ={
       out_trade_no: 'order1'
  };
  const appOrder = await wechatpay.createUnifiedOrderForApp(orderParams);
  expect(appOrder).toMatchObject({
    partnerid: expect.stringMatching(/\d{10}/),
    prepayid: expect.stringMatching(/[a-z0-9]{36}/),
    noncestr: expect.stringMatching(/.+/),
    timestamp: expect.stringMatching(/\d{10}/),
    sign: expect.stringMatching(/[A-Z0-9]{32}/),
  });
});
