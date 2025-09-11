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
