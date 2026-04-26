import { InjectionToken } from '@angular/core';

/**
 * Опции {@link provideYandexMetrikaRouter} для учёта virtual pageview при навигации SPA.
 */
export interface YandexMetrikaRouterOptions {
  /**
   * Пропустить первый `NavigationEnd` (обычно совпадает с первой загрузкой),
   * чтобы не дублировать просмотр, который уже уходит при инициализации счётчика.
   *
   * @default true
   */
  ignoreInitialNavigation?: boolean;

  /**
   * Передавать в {@link YMService.hit} текущий заголовок окна (`Title.getTitle()`)
   * в поле `title` второго аргумента.
   *
   * @default true
   */
  includePageTitle?: boolean;
}

/**
 * @internal
 */
export type YandexMetrikaRouterOptionsResolved = Readonly<{
  ignoreInitialNavigation: boolean;
  includePageTitle: boolean;
}>;

export const YM_DEFAULT_ROUTER_OPTIONS: YandexMetrikaRouterOptionsResolved = {
  ignoreInitialNavigation: true,
  includePageTitle: true,
};

/**
 * @internal
 */
export const YM_ROUTER_OPTIONS = new InjectionToken<YandexMetrikaRouterOptionsResolved>(
  'YM_ROUTER_OPTIONS',
);
