import WechatPayment from 'wechat-payment-node';
import WechatPaymentUtils from 'wechat-payment-node/lib/utils';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

export interface IConfig {
  appid: string; // APP ID
  mch_id: string; // 商户 ID
  apiKey: string; //微信商户平台API密钥
  notify_url: string; // 回调URL地址
  trade_type: 'APP'; //APP, JSAPI, NATIVE etc.
  pfx: Buffer; // p12文件位置
}

export interface IOrderParams {
  body: string;
  out_trade_no: string;
  total_fee: number;
  spbill_create_ip: string;
  notify_url: string;
  trade_type: string;
}

export interface IOrderResult {
  return_code: 'SUCCESS' | 'FAIL';
  return_msg: string;
  appid: string;
  mch_id: string;
  nonce_str: string;
  sign: string;
  result_code: 'SUCCESS' | 'FAIL';
  prepay_id: string;
  trade_type: 'JSAPI' | 'APP' | 'NATIVE';
}

export interface IAPPOrderResult {
  partnerid: string; // merchant id
  prepayid: string; // prepay id
  noncestr: string; // nonce
  timestamp: string; // timestamp
  sign: string; // signed string
}

export interface IWechatpay {
  signVerify: (xml: any) => Promise<boolean>;
  success: () => string;
  fail: () => string;
  createUnifiedOrder: (obj: IOrderParams) => Promise<IOrderResult>;
  createUnifiedOrderForApp: (obj: IOrderParams) => Promise<IAPPOrderResult>;
}

export class Wechatpay extends WechatPayment implements IWechatpay {
  private __config: IConfig;

  constructor(config: IConfig) {
    super(config);
    this.__config = config;
  }

  get config() {
    return this.__config;
  }

  public createUnifiedOrder = (obj: IOrderParams): Promise<IOrderResult> => {
    return super.createUnifiedOrder(obj);
  }

  public signVerify = async notification => {
    let dataForSign = Object.assign({}, notification);
    delete dataForSign.sign;
    let signValue = WechatPaymentUtils.sign(dataForSign, this.config.apiKey);
    return signValue === notification.sign;
  };

  public createUnifiedOrderForApp = async (obj: IOrderParams): Promise<IAPPOrderResult> => {
    let res = await this.createUnifiedOrder(obj);
    if(res.return_code !== 'SUCCESS') throw new Error(res.return_msg);
    let params: any = {
      appid: this.config.appid,
      partnerid: res.mch_id,
      prepayid: res.prepay_id,
      package: 'Sign=WXPay',
      noncestr: res.nonce_str,
      timestamp: String(Math.floor(new Date().getTime() / 1000)),
    };
    let str = Object.keys(params).sort()
      .map(k => `${k}=${params[k]}`)
      .join('&') + '&key=' + this.config.apiKey;
    params.sign = createHash('md5').update(str).digest('hex').toUpperCase();
    return params;
  }

  public success(): string {
    return WechatPaymentUtils.buildXML({ xml: { return_code: 'SUCCESS' } });
  }
  
  public fail(): string {
    return WechatPaymentUtils.buildXML({ xml: { return_code: 'FAIL' } });
  }
}
