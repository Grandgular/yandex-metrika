import {
  EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideAppInitializer,
} from '@angular/core';
import { YM_CONFIG_TOKEN } from './ym-config-token';
import { YMInitService } from './ym-init-service';
import { isPlatformBrowser } from '@angular/common';
import { YMConfig } from './ym-config-interface';

/**
 * Provides Yandex Metrika configuration and initialization for Angular applications.
 *
 * This function sets up the necessary providers to configure and automatically initialize
 * Yandex Metrika when the application starts. It should be called in your app's provider array.
 *
 * @param config - The Yandex Metrika configuration object. Only the `id` property is required,
 * all other properties are optional and will use default values if omitted.
 *
 * @returns EnvironmentProviders that can be included in Angular's provider configuration.
 *
 * @example
 * // In app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideYandexMetrika({
 *       id: 104120889,
 *       prodOnly: true,
 *       loading: 'async',
 *       options: {
 *         webvisor: true,
 *         ecommerce: 'dataLayer'
 *       }
 *     })
 *   ]
 * };
 *
 * @remarks
 * - Automatically initializes Yandex Metrika during application startup
 * - Handles platform checks (browser vs server)
 * - Respects prodOnly flag to avoid initialization in development mode
 * - Uses APP_INITIALIZER to ensure early initialization
 *
 * @see YMConfig - For configuration options interface
 * @see YMInitService - For the underlying initialization service
 */
export function provideYandexMetrika(config: YMConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: YM_CONFIG_TOKEN,
      useValue: config,
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
