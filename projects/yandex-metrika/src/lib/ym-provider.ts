import {
  EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { YM_CONFIG_TOKEN, YM_DEFAULT_CONFIG_TOKEN } from './ym-config-token';
import { YMInitService } from './ym-init-service';
import { YMConfig } from './ym-config-interface';
import { libName } from './ym-lib-name';

/**
 * Функция для предоставления и настройки Яндекс.Метрики в Angular приложениях.
 *
 * Настраивает один или несколько счетчиков Яндекс.Метрики с учетом окружения и автоматически
 * инициализирует их при запуске приложения.
 *
 * @example
 * // Один счетчик
 * provideYandexMetrika({
 *   id: 104120889,
 *   prodOnly: true,
 *   options: { webvisor: true }
 * })
 *
 * @example
 * // Несколько счетчиков
 * provideYandexMetrika([
 *   {
 *     id: 104120889,
 *     name: 'продакшен',
 *     prodOnly: true,
 *     default: true
 *   },
 *   {
 *     id: 35567075,
 *     name: 'тестовый',
 *     options: { trackLinks: true }
 *   }
 * ])
 *
 * @param config - Объект конфигурации YMConfig или массив конфигураций для нескольких счетчиков.
 * При использовании нескольких счетчиков, первый счетчик с `default: true` будет использоваться по умолчанию,
 * в противном случае будет выбран первый доступный счетчик в массиве.
 *
 * @returns EnvironmentProviders с настроенными провайдерами для интеграции с Яндекс.Метрикой
 *
 * @remarks
 * - Счетчики с `prodOnly: true` автоматически пропускаются в режиме разработки
 * - Выводит предупреждения в консоль для неправильно настроенных или недоступных счетчиков
 * - Поддерживает как одиночные, так и множественные конфигурации счетчиков
 *
 * @throws Выводит предупреждения в консоль при проблемах с конфигурацией, но не выбрасывает исключения
 *
 * @see YMConfig - Интерфейс конфигурации счетчика
 * @see YMService - Для работы с API после инициализации
 */
export function provideYandexMetrika(config: YMConfig | YMConfig[]): EnvironmentProviders {
  const configs = Array.isArray(config) ? config : [config];
  const isDev = isDevMode();
  const availableConfigs = configs.filter((config) => !config.prodOnly || !isDev);

  if (availableConfigs.length === 0) {
    console.warn(
      `${libName}: Нет доступных счетчиков для текущего окружения. Счетчики будут инициализированы только в продакшене.`,
    );
  } else if (availableConfigs.length < configs.length) {
    console.log(
      `${libName}: ${configs.length - availableConfigs.length} счетчик(ов) пропущены из-за настройки prodOnly`,
    );
  }

  const defaultCounter =
    availableConfigs.find((config) => config.default) || availableConfigs[0] || null;
  const explicitDefault = configs.find((config) => config.default);

  if (explicitDefault && !availableConfigs.some((config) => config.id === explicitDefault.id)) {
    console.warn(
      `${libName}: Явно указанный счетчик по умолчанию "${explicitDefault.name || explicitDefault.id}" недоступен в текущем окружении`,
    );
  }

  return makeEnvironmentProviders([
    {
      provide: YM_CONFIG_TOKEN,
      useValue: configs,
    },
    {
      provide: YM_DEFAULT_CONFIG_TOKEN,
      useValue: defaultCounter,
    },
    provideAppInitializer(() => {
      const metrika = inject(YMInitService);
      const configs = inject(YM_CONFIG_TOKEN);

      configs.forEach((config) => metrika.initialize(config, config.id === defaultCounter?.id));

      return Promise.resolve();
    }),
  ]);
}
