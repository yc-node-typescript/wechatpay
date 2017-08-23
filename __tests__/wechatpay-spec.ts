import { parseXML } from '../src/utils';
import {
  IConfig,
  IQueryOrderParams,
  IOrderParams,
  Wechatpay,
} from '../src/wechatpay';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as Nhm from 'nhm';

const appid = 'wxd457bea6a1506dc5';
const mch_id = '1486513462';
const apiKey = '80Adxl69yfEMzlZ5WSAnG4jAtXs5yITm';
const out_trade_no = new Nhm(32, {
  lowerCase: true,
  upperCase: false,
  number: true,
  symbol: false,
}).toString();
const out_refund_no = new Nhm(32, {
  lowerCase: true,
  upperCase: false,
  number: true,
  symbol: false,
}).toString();

const total_fee = 100;
const config: IConfig = {
  appid: appid,
  mch_id: mch_id,
  apiKey: apiKey, //微信商户平台API密钥
  notify_url: `http://example.com`,
  trade_type: 'APP', //APP, JSAPI, NATIVE etc.
  pfx: readFileSync(resolve('./apiclient_cert.p12')),
};
const wechatpay = new Wechatpay(config);

test('Should create an order', async () => {
  const orderParams: IOrderParams = {
    body: '支付测试', // 商品或支付单简要描述
    out_trade_no: out_trade_no, // 商户系统内部的订单号,32个字符内、可包含字母
    total_fee: total_fee,
    spbill_create_ip: '192.168.2.1',
    notify_url: 'http://wxpayment_notify_url',
    trade_type: 'APP',
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

test('Should query an order', async () => {
  const queryOrder = await wechatpay.queryOrder({
    out_trade_no: out_trade_no,
  });
  expect(queryOrder).toMatchObject({
    return_code: 'SUCCESS',
    return_msg: 'OK',
    appid: appid,
    mch_id: mch_id,
    nonce_str: expect.stringMatching(/.+/),
    sign: expect.stringMatching(/[A-Z0-9]{32}/),
    result_code: 'SUCCESS',
    out_trade_no: out_trade_no,
    trade_state: 'NOTPAY',
    trade_state_desc: '订单未支付',
  });
});

test('Should close an order', async () => {
  const closeOrder = await wechatpay.closeOrder({
    out_trade_no: out_trade_no,
  });
  expect(closeOrder).toMatchObject({
    return_code: 'SUCCESS',
    return_msg: 'OK',
    appid: appid,
    mch_id: mch_id,
    sub_mch_id: expect.stringMatching(/.*/),
    nonce_str: expect.stringMatching(/.+/),
    sign: expect.stringMatching(/[A-Z0-9]{32}/),
    result_code: 'SUCCESS',
  });
});

test('Should refund an order', async () => {
  const refundOrder = await wechatpay.refund({
    out_trade_no: out_trade_no,
    out_refund_no: out_refund_no,
    total_fee: total_fee,
    refund_fee: total_fee,
  });
  expect(refundOrder).toMatchObject({
    return_code: 'FAIL',
    return_msg: '订单未支付，不需要发起退款',
  });
});

test('Should Verified signature', () => {
   const issign =  wechatpay.signVerify({sign : "123"});
   expect(issign).toBe(false);
})

test('Should Return SUCCESS' ,async () => {
   const status = wechatpay.success();
   const suobj = await parseXML(status);
   expect(suobj).toMatchObject({
       return_code : 'SUCCESS',
       return_msg : 'OK',
   });
})

test('Should Return FAIL' ,async () => {
   const status = wechatpay.fail();
   const faobj = await parseXML(status);
   expect(faobj).toMatchObject({
       return_code : 'FAIL',
       return_msg : '签名失败',
   });
})
