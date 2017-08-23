import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import * as request from 'request';
import { urls } from './urls';
import * as utils from './utils';

export interface IConfig {
  appid: string; // APP ID
  mch_id: string; // 商户 ID
  apiKey: string; // 微信商户平台API密钥
  notify_url: string; // 回调URL地址
  trade_type: 'APP'; // APP, JSAPI, NATIVE etc.
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

export interface IQueryOrderParams {
  out_trade_no?: string;
  transaction_id?: string;
}

export interface IQueryOrderResult {
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

export interface ICloseResult {
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

export interface IRefundParams extends IQueryOrderParams {
  out_refund_no: string;
  total_fee: number;
  refund_fee: number;
  refund_fee_type?: string;
  refund_desc?: string;
  refund_account?: string;
}

export interface IRefundResult {
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

export interface IQueryRefundResult {
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

export class Wechatpay {
  private __config: IConfig;
  constructor(config: IConfig) {
    if (!config.appid || !config.mch_id) {
      throw new Error(
        'Seems that app id or merchant id is not set, please provide wechat app id and merchant id.'
      );
    }
    this.__config = config;
  }

  get config(): IConfig {
    return this.__config;
  }

  public createUnifiedOrder(orderParams: IOrderParams): Promise<IOrderResult> {
    const order = orderParams as any;
    return new Promise((resolve, reject) => {
      order.nonce_str = order.nonce_str || utils.createNonceStr();
      order.appid = this.config.appid;
      order.mch_id = this.config.mch_id;
      order.sign = utils.sign(order, this.config.apiKey);
      const requestParam = {
        url: urls.UNIFIED_ORDER,
        method: 'POST',
        body: utils.buildXML(order),
      };
      request(requestParam, (err, response, body) => {
        if (err) {
          reject(err);
        }
        utils
          .parseXML(body)
          .then((result: IOrderResult) => {
            resolve(result);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }

  public async createUnifiedOrderForApp(
    obj: IOrderParams
  ): Promise<IAPPOrderResult> {
    const res = await this.createUnifiedOrder(obj);
    if (res.return_code !== 'SUCCESS') throw new Error(res.return_msg);
    return this.configForPayment(res.prepay_id);
  }

  public configForPayment(prepayId: string) {
    const configData: any = {
      appid: this.config.appid,
      partnerid: this.config.mch_id,
      prepayid: prepayId,
      package: 'Sign=WXPay',
      noncestr: utils.createNonceStr(),
      timestamp: Math.floor(new Date().getTime() / 1000),
    };
    configData.sign = utils.sign(configData, this.config.apiKey);
    return configData;
  }

  public queryOrder(
    queryParams: IQueryOrderParams
  ): Promise<IQueryOrderResult> {
    const query = queryParams as any;
    return new Promise((resolve, reject) => {
      query.nonce_str = query.nonce_str || utils.createNonceStr();
      query.appid = this.config.appid;
      query.mch_id = this.config.mch_id;
      query.sign = utils.sign(query, this.config.apiKey);

      request(
        {
          url: urls.ORDER_QUERY,
          method: 'POST',
          body: utils.buildXML({ xml: query }),
        },
        (err, res, body) => {
          utils
            .parseXML(body)
            .then((result: IQueryOrderResult) => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        }
      );
    });
  }

  public closeOrder(orderParams: IQueryOrderParams): Promise<ICloseResult> {
    const order = orderParams as any;
    return new Promise((resolve, reject) => {
      order.nonce_str = order.nonce_str || utils.createNonceStr();
      order.appid = this.config.appid;
      order.mch_id = this.config.mch_id;
      order.sign = utils.sign(order, this.config.apiKey);

      request(
        {
          url: urls.CLOSE_ORDER,
          method: 'POST',
          body: utils.buildXML({ xml: order }),
        },
        (err, res, body) => {
          utils
            .parseXML(body)
            .then(result => {
              resolve(result as ICloseResult);
            })
            .catch(err => {
              reject(err);
            });
        }
      );
    });
  }

  public refund(orderParams: IRefundParams): Promise<IRefundResult> {
    const order = orderParams as any;
    return new Promise((resolve, reject) => {
      order.nonce_str = order.nonce_str || utils.createNonceStr();
      order.appid = this.config.appid;
      order.mch_id = this.config.mch_id;
      order.sign = utils.sign(order, this.config.apiKey);

      request(
        {
          url: urls.REFUND,
          method: 'POST',
          body: utils.buildXML({ xml: order }),
          agentOptions: {
            pfx: this.config.pfx,
            passphrase: this.config.mch_id,
          },
        },
        (err, response, body) => {
          utils
            .parseXML(body)
            .then(result => {
              resolve(result as IRefundResult);
            })
            .catch(err => {
              reject(err);
            });
        }
      );
    });
  }

  public queryRefund(
    orderParams: IQueryOrderParams
  ): Promise<IQueryRefundResult> {
    const order = orderParams as any;
    return new Promise((resolve, reject) => {
      if (
        !(
          order.transaction_id ||
          order.out_trade_no ||
          order.out_refund_no ||
          order.refund_id
        )
      ) {
        reject(new Error('缺少参数'));
      }

      order.nonce_str = order.nonce_str || utils.createNonceStr();
      order.appid = this.config.appid;
      order.mch_id = this.config.mch_id;
      order.sign = utils.sign(order, this.config.apiKey);

      request(
        {
          url: urls.REFUND_QUERY,
          method: 'POST',
          body: utils.buildXML({ xml: order }),
        },
        (err, response, body) => {
          utils
            .parseXML(body)
            .then(result => {
              resolve(result as IQueryRefundResult);
            })
            .catch(err => {
              reject(err);
            });
        }
      );
    });
  }

  public signVerify(notification): boolean {
    const dataForSign = Object.assign({}, notification);
    delete dataForSign.sign;
    const signValue = utils.sign(dataForSign, this.config.apiKey);
    return signValue === notification.sign;
  }

  public success(): string {
    return utils.buildXML({ xml: { return_code: 'SUCCESS' } });
  }

  public fail(): string {
    return utils.buildXML({ xml: { return_code: 'FAIL' } });
  }
}
