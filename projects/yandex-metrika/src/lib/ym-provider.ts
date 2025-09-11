import {
  EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideAppInitializer,
} from '@angular/core';
import { YMConfig, YMConfigOptional } from './ym-interfaces';
import { YM_CONFIG_TOKEN } from './ym-config-token';
import { YMInitService } from './ym-init-service';
import { isPlatformBrowser } from '@angular/common';
import { defaultYMConfig } from './ym-config-default';

export function provideYandexMetrika(userConfig: YMConfigOptional): EnvironmentProviders {
  const mergedConfig = mergeYMConfig(userConfig);

  return makeEnvironmentProviders([
    {
      provide: YM_CONFIG_TOKEN,
      useValue: mergedConfig, // Передаем уже объединенный конфиг
    },
    provideAppInitializer(() => {
      const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
      const metrika = inject(YMInitService);
      const config = inject(YM_CONFIG_TOKEN);
      const shouldInitialize = isBrowser && (!config?.prodOnly || !isDevMode());

      if (shouldInitialize) metrika.initialize(config);

      return Promise.resolve();
    }),
  ]);
}

function mergeYMConfig(userConfig: YMConfigOptional): YMConfig {
  return {
    ...defaultYMConfig,
    ...userConfig,
    options: {
      ...defaultYMConfig.options,
      ...userConfig.options,
    },
  };
}
