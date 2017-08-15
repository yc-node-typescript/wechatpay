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

export interface IOrder {
  out_trade_no: string;
}

export interface IcloseResult {
  return_code: 'SUCCESS' | 'FAIL';
  return_msg: string;
  appid: string;
  mch_id: string;
  nonce_str: string;
  sign: string;
  result_code: string;
}


export interface IAPPOrderResult {
  partnerid: string; // merchant id
  prepayid: string; // prepay id
  noncestr: string; // nonce
  timestamp: string; // timestamp
  sign: string; // signed string
}

export interface Iquertorder {
  return_code: 'SUCCESS' | 'FAIL';
  return_msg: string;
  appid: string;
  mch_id: string; // 'your merchant id',
  nonce_str: 'P6IFNTlKWVKtlOH4';
  sign: string;
  result_code: string;
  out_trade_no: string;
  trade_state: string;
  trade_state_desc: string;
}

export interface IRefund {
  return_code: 'SUCCESS' | 'FAIL';
  return_msg: string;
  appid: string;
  mch_id: string;
  nonce_str: string;
  sign: string;
  result_code: string;
  transaction_id: string;
  out_trade_no: string;
  out_refund_no: string;
  refund_id: string;
  refund_channel: string;
  refund_fee: string;
  coupon_refund_fee: string;
  total_fee: string;
  cash_fee: string;
  coupon_refund_count: string;
  cash_refund_fee: string;
}

export interface IQueryRefund {
  appid: string;
  cash_fee: string;
  mch_id: string;
  nonce_str: string;
  out_refund_no_0: string;
  out_trade_no: string;
  refund_channel_0: string;
  refund_count: string;
  refund_fee: string;
  refund_fee_0: string;
  refund_id_0: string;
  refund_recv_accout_0: string;
  refund_status_0: string;
  result_code: string;
  return_code: string;
  return_msg: string;
  sign: string;
  total_fee: string;
  transaction_id: string;
}

export interface IWechatpay {
  signVerify: (xml: any) => Promise<boolean>;
  success: () => string;
  fail: () => string;
  createUnifiedOrder: (obj: IOrderParams) => Promise<IOrderResult>;
  createUnifiedOrderForApp: (obj: IOrderParams) => Promise<IAPPOrderResult>;
  queryorder: (obj: IOrder) => Promise<Iquertorder>; //查询订单
  closeorder: (obj: IOrder) => Promise<IcloseResult>; //关闭订单
  Refundorder: (obj: IOrder) => Promise<IRefund>;
  QueryRefund: (obj: IOrder) => Promise<IQueryRefund>;

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

  public Refundorder = (obj: IOrder): Promise<IRefund> => {
    return super.refund(obj);
  };

  public QueryRefund = (obj: IOrder): Promise<IQueryRefund> => {
    return super.queryRefund(obj);
  }


  public createUnifiedOrder = (obj: IOrderParams): Promise<IOrderResult> => {
    return super.createUnifiedOrder(obj);
  };

  public queryorder = (obj: IOrder): Promise<Iquertorder> => {
    return super.queryOrder(obj);
  };

  public closeorder = (obj: IOrder): Promise<IcloseResult> => {
    return super.closeOrder(obj);
  };

  public signVerify = async notification => {
    let dataForSign = Object.assign({}, notification);
    delete dataForSign.sign;
    let signValue = WechatPaymentUtils.sign(dataForSign, this.config.apiKey);
    return signValue === notification.sign;
  };

  public createUnifiedOrderForApp = async (
    obj: IOrderParams
  ): Promise<IAPPOrderResult> => {
    let res = await this.createUnifiedOrder(obj);
    if (res.return_code !== 'SUCCESS') throw new Error(res.return_msg);
    let params: any = {
      appid: this.config.appid,
      partnerid: res.mch_id,
      prepayid: res.prepay_id,
      package: 'Sign=WXPay',
      noncestr: res.nonce_str,
      timestamp: String(Math.floor(new Date().getTime() / 1000)),
    };
    let str =
      Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') +
      '&key=' +
      this.config.apiKey;
    params.sign = createHash('md5').update(str).digest('hex').toUpperCase();
    return params;
  };

  public success(): string {
    return WechatPaymentUtils.buildXML({ xml: { return_code: 'SUCCESS' } });
  }

  public fail(): string {
    return WechatPaymentUtils.buildXML({ xml: { return_code: 'FAIL' } });
  }
}
