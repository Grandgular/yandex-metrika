import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { YM_DEFAULT_ROUTER_OPTIONS, YM_ROUTER_OPTIONS, YandexMetrikaRouterOptions } from './ym-router-options';
import { YandexMetrikaRouterTracker } from './ym-router-tracker.service';

/**
 * Подключает автоматическую отправку virtual pageview в Яндекс.Метрику при навигации
 * (событие `NavigationEnd` → {@link YMService.hit}).
 *
 * Поместите **после** {@link provideYandexMetrika} в `ApplicationConfig`, чтобы
 * `YMService` и счётчики были настроены.
 *
 * @example
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideYandexMetrika({ id: 123, options: { defer: true } }),
 *     provideYandexMetrikaRouter({ ignoreInitialNavigation: true }),
 *   ],
 * };
 * ```
 */
export function provideYandexMetrikaRouter(
  options?: YandexMetrikaRouterOptions,
): EnvironmentProviders {
  const resolved = { ...YM_DEFAULT_ROUTER_OPTIONS, ...options };

  return makeEnvironmentProviders([
    { provide: YM_ROUTER_OPTIONS, useValue: resolved },
    YandexMetrikaRouterTracker,
    provideAppInitializer(() => {
      inject(YandexMetrikaRouterTracker);
      return Promise.resolve();
    }),
  ]);
}

export type { YandexMetrikaRouterOptions } from './ym-router-options';
