import { YMConfig } from './ym-interfaces';

export const defaultYMConfig: Omit<YMConfig, 'id'> = {
  prodOnly: false,
  loading: 'async',
  options: {
    ecommerce: 'dataLayer',
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    trackHash: false,
    webvisor: false,
    triggerEvent: false,
    // ssr: false,
  },
};
