export interface YMConfig {
  id: number;
  prodOnly: boolean;
  loading: 'async' | 'defer' | 'sync';
  options: {
    clickmap: boolean;
    trackLinks: boolean;
    accurateTrackBounce: boolean;
    trackHash: boolean;
    webvisor: boolean;
    ecommerce: boolean | string;
    triggerEvent: boolean;
    // ssr: boolean;
  };
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type YMConfigOptional = {
  id: number;
} & DeepPartial<Omit<YMConfig, 'id'>>;
