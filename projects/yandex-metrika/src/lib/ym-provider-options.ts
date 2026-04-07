/**
 * Опции провайдера {@link provideYandexMetrika}.
 */
export interface YandexMetrikaProviderOptions {
  /**
   * Когда загружать счётчик и скрипт Метрики.
   *
   * - `immediate` — при старте приложения (`APP_INITIALIZER`), как раньше.
   * - `deferred` — не загружать до явного вызова {@link YMInitService.initializeAll}
   *   (например после согласия на cookies).
   *
   * @default 'immediate'
   */
  initialization?: 'immediate' | 'deferred';
}
