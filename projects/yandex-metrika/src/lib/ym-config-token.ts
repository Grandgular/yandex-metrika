import { InjectionToken } from '@angular/core';
import { YMConfig } from './interfaces/ym-config-interfaces';

export const YM_CONFIG_TOKEN = new InjectionToken<YMConfig>('YM_CONFIG_TOKEN');
