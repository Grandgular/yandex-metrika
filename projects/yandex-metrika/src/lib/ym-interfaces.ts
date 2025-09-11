export interface YMConfig {
  id: number | string;
  init: {
    prodOnly: boolean;
    defer: boolean;
  };
  tracking: {
    clickmap: boolean;
    trackLinks: boolean;
    accurateTrackBounce: boolean;
    trackHash: boolean;
  };
  features: {
    webvisor: boolean;
    ecommerce: boolean | string;
    triggerEvent: boolean;
  };
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type YMConfigOptional = {
  id: number | string;
} & DeepPartial<Omit<YMConfig, 'id'>>;
