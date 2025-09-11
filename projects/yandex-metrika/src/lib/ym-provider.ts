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
import { YMService } from './ym-service';
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
      const metrika = inject(YMService);
      const config = inject(YM_CONFIG_TOKEN);
      const shouldInitialize = isBrowser && (!config.init?.prodOnly || !isDevMode());

      if (shouldInitialize) metrika.initialize(config);

      return Promise.resolve();
    }),
  ]);
}

function mergeYMConfig(userConfig: YMConfigOptional): YMConfig {
  return {
    ...userConfig,
    init: {
      ...defaultYMConfig.init,
      ...userConfig.init,
    },
    tracking: {
      ...defaultYMConfig.tracking,
      ...userConfig.tracking,
    },
    features: {
      ...defaultYMConfig.features,
      ...userConfig.features,
    },
  };
}
