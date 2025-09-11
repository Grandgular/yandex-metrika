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

// <!-- Yandex.Metrika counter -->
// <script type="text/javascript">
//   (function(m,e,t,r,i,k,a){
//     m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
//     m[i].l=1*new Date();
//     for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
//     k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
//   })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104120889', 'ym');
//
// ym(, 'init', {});
// </script>
// <noscript><div><img src="https://mc.yandex.ru/watch/104120889" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
// <!-- /Yandex.Metrika counter -->
