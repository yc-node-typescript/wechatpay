[![Build Status](https://travis-ci.org/yc-node-typescript/wechatpay.svg?branch=master)](https://travis-ci.org/yc-node-typescript/wechatpay.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/yc-node-typescript/wechatpay/badge.svg?branch=master)](https://coveralls.io/github/yc-node-typescript/wechatpay?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# 安装

```bash
npm i -S @ycnt/wechatpay
```
或
```bash
yarn add @ycnt/wechatpay
```
# 使用方法
> 配置
```ts
import { Wechatpay } from '@ycnt/wechatpay';

const wechatpay = new Wechatpay({
  appid: 'xxxx',
  mch_id: 'xxxx',
  apiKey: 'xxxx', // 微信商户平台API密钥
  notify_url: `http://example.com`,
  trade_type: 'APP', // APP, JSAPI, NATIVE etc.
  pfx: readFileSync(resolve('xxxx/apiclient_cert.p12')),
});
```

## 创建订单
```ts
const orderParams: IOrderParams = {
  body: '支付测试', // 商品或支付单简要描述
  out_trade_no: 'xxx', // 商户系统内部的订单号,32个字符内、可包含字母
  total_fee: 100, // 价格单位为分
  spbill_create_ip: '127.0.0.1', // 客户IP地址
  notify_url: 'http://wxpayment_notify_url', // 回调通知接口URL
  trade_type: 'APP', // APP, JSAPI, NATIVE etc.
};

const order = await wechatpay.createUnifiedOrder(orderParams);
```

## 创建支付对象
> 支付对象是客户端用于发起支付的凭据
```ts
const payment = wechatpay.configForPayment(order);
```

## 查寻订单
```ts
const queryOrder = await wechatpay.queryOrder({
  out_trade_no: 'xxx',
});
```

## 关闭订单
```ts
const closeOrder = await wechatpay.closeOrder({
  out_trade_no: 'xxx',
});
```

## 退款
```ts
const refundOrder = await wechatpay.refund({
  out_trade_no: 'xxx',
  out_refund_no: 'xxx', // 退款流水号，同一流水号多次退款只会处理一次
  total_fee: 100, // 订单总额
  refund_fee: 100, // 退款金额
});
```

## 退款查寻
```ts
const queryRefund = await wechatpay.queryRefund({
  out_trade_no: 'xxx',
});
```

## 反馈信息验证
> 支付成功后微信给后台反馈的信息为XML格式。
为了安全，我们需要对信息进行验证。
```ts
const xml = `微信通知的内容`
const obj = `转xml为Object`
const isSignOk = wechatpay.signVerify(obj);
```

## 给微信返回结果
> 微信反馈信息后，我们需要回复成功或失败，格式为XML。
不然微信会持续发送反馈信息。
下面两个方法会创建XML格式的回复信息。
```ts
const success: string = wechatpay.success(); // 成功XML信息
const fail: string = wechatpay.fail(); // 失败XML信息
```