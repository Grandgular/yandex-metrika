import { YMMethod } from './ym-method-enum';

/**
 * Тип для аргументов методов (для улучшения типобезопасности)
 */
export type YMMethodArgs = {
  [YMMethod.AddFileExtension]: [extensions: string | string[]];
  [YMMethod.ExtLink]: [
    url: string,
    options?: {
      callback?: Function;
      ctx?: Object;
      params?: {
        order_price?: number;
        currency?: string;
      };
      title?: string;
    },
  ];
  [YMMethod.File]: [
    string,
    {
      callback?: Function;
      ctx?: Object;
      params?: {
        order_price?: number;
        currency?: string;
      };
      referer?: string;
      title?: string;
    }?,
  ];
  [YMMethod.FirstPartyParams]: [
    parameters: {
      email?: string;
      phone_number?: string;
      first_name?: string;
      last_name?: string;
      yandex_cid?: number | string;
    },
  ];
  [YMMethod.FirstPartyParamsHashed]: [
    parameters: {
      email?: string; // SHA-256 хеш email
      phone_number?: string; // SHA-256 хеш номера телефона (только цифры)
      first_name?: string; // SHA-256 хеш имени
      last_name?: string; // SHA-256 хеш фамилии
      yandex_cid?: number | string; // не хешируется
    },
  ];
  [YMMethod.GetClientID]: [callback: (clientID: string) => void];
  [YMMethod.Hit]: [
    url?: string,
    options?: {
      callback?: Function;
      ctx?: Object;
      params?: {
        order_price?: number;
        currency?: string;
      };
      referer?: string;
      title?: string;
    },
  ];
  [YMMethod.NotBounce]: [
    options?: {
      callback?: Function;
      ctx?: Object;
    },
  ];
  [YMMethod.Params]: [parameters: Record<string, any> | Array<Record<string, any>>];
  [YMMethod.ReachGoal]: [
    target: string,
    params?: {
      order_price?: number;
      price?: number;
      currency?: string;
    },
    callback?: Function,
    ctx?: Object,
  ];
  [YMMethod.SetUserID]: [userID: string];
  [YMMethod.UserParams]: [
    parameters: {
      UserID?: string | number;
      [key: string]: any;
    },
  ];
};
