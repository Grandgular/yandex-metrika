import { YMConfig } from './ym-interfaces';

export const defaultYMConfig: Omit<YMConfig, 'id'> = {
  prodOnly: false,
  loading: 'async',
  options: {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    trackHash: false,
    webvisor: false,
    ecommerce: false,
    triggerEvent: false,
  },
};
