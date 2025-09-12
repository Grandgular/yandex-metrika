import { InjectionToken } from '@angular/core';
import { YMConfig } from './ym-config-interface';

export const YM_CONFIG_TOKEN = new InjectionToken<YMConfig[]>('YM_CONFIG_TOKEN');
export const YM_DEFAULT_CONFIG_TOKEN = new InjectionToken<YMConfig | null>(
  'YM_DEFAULT_CONFIG_TOKEN',
);
