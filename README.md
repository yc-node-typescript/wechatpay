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

## 创建APP订单
```ts
const orderParams: IOrderParams = {
  body: '支付测试', // 商品或支付单简要描述
  out_trade_no: 'xxx', // 商户系统内部的订单号,32个字符内、可包含字母
  total_fee: 100, // 价格单位为分
  spbill_create_ip: '127.0.0.1', // 客户IP地址
  notify_url: 'http://wxpayment_notify_url', // 回调通知接口URL
  trade_type: 'APP', // APP, JSAPI, NATIVE etc.
};

const appOrder = await wechatpay.createUnifiedOrderForApp(orderParams);
```