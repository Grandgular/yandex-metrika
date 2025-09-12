import { Injectable, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YM_CONFIG_TOKEN, YM_DEFAULT_CONFIG_TOKEN } from './ym-config-token';
import { YMConfig } from './ym-config-interface';
import { libName } from './ym-lib-name';

/**
 * Основной сервис для работы с API Яндекс.Метрики в Angular приложениях.
 *
 * Предоставляет типобезопасную обертку над глобальной функцией `ym` с автоматической обработкой конфигурации,
 * проверкой окружения и обработкой ошибок. Поддерживает работу с одним или несколькими счетчиками.
 *
 * @example
 * // Использование в компонентах
 * metrika = inject(YMService)
 *
 * trackEvent() {
 *   this.metrika.ym('reachGoal', 'покупка', { сумма: 1000 });
 * }
 *
 * @remarks
 * - Автоматически обрабатывает внедрение конфигурации
 * - Выполняет проверки окружения (браузер, production режим)
 * - Обеспечивает обработку ошибок и предупреждения
 * - Поддерживает явное и неявное указание ID счетчика
 * - Работает с несколькими счетчиками через ID или имя
 *
 * @see YMConfig - Для опций конфигурации
 * @see provideYandexMetrika - Для настройки провайдеров
 */
@Injectable({ providedIn: 'root' })
export class YMService {
  readonly #configs = inject(YM_CONFIG_TOKEN, { optional: true });
  readonly #defaultConfig = inject(YM_DEFAULT_CONFIG_TOKEN, { optional: true });
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Универсальный метод для вызова любого метода API Яндекс.Метрики.
   * Поддерживает работу с несколькими счетчиками через ID или имя.
   *
   * @example
   * // Использование счетчика по умолчанию
   * ym('hit', '/главная');
   * ym('reachGoal', 'регистрация', { план: 'премиум' });
   *
   * @example
   * // Использование счетчика по ID
   * ym(123456, 'hit', '/страница');
   * ym(123456, 'ecommerce.addProduct', данныеТовара);
   *
   * @example
   * // Использование счетчика по имени
   * ym('аналитика', 'params', { userId: '123' });
   * ym('бэкап', 'userParams', данныеПользователя);
   *
   * @param args - Аргументы для передачи в API Яндекс.Метрики.
   * Если первый аргумент number - воспринимается как ID счетчика
   * Если первый аргумент string и совпадает с именем счетчика - воспринимается как имя счетчика
   * В остальных случаях используется счетчик по умолчанию
   *
   * @throws Выводит предупреждения и ошибки в консоль, но не выбрасывает исключения
   *
   * @remarks
   * - Автоматически проверяет доступность счетчиков и конфигурацию
   * - Выполняет валидацию аргументов метода (наличие и типы)
   * - Обрабатывает как одиночные, так и множественные конфигурации счетчиков
   * - Предоставляет детальные сообщения об ошибках для отладки
   *
   * @see https://yandex.com/support/metrica/js-api - Полная документация API Яндекс.Метрики
   */
  public ym(counterIdOrName: number | string, ...args: unknown[]): void;
  public ym(...args: unknown[]): void;

  public ym(...args: unknown[]): void {
    if (args.length === 0) {
      console.warn(`${libName}: Не предоставлены аргументы`);
      return;
    }

    const firstArg = args[0];
    const isFirstArgId = typeof firstArg === 'number';
    const isFirstArgName = typeof firstArg === 'string' && this.isCounterName(firstArg);

    let counterIdentifier: string | number | undefined;
    let methodArgs: unknown[];
    let targetCounterId: number | undefined;

    if (isFirstArgId) {
      counterIdentifier = firstArg;
      methodArgs = args.slice(1);
      targetCounterId = firstArg;
    } else if (isFirstArgName) {
      counterIdentifier = firstArg;
      methodArgs = args.slice(1);
      targetCounterId = this.getCounterIdByName(firstArg);
    } else {
      methodArgs = args;
      targetCounterId = this.#defaultConfig?.id;
    }

    if (!this.canExecute(counterIdentifier)) return;

    if (!targetCounterId) {
      console.warn(`${libName}: Не найден действительный ID счетчика`);
      return;
    }

    if (methodArgs.length === 0) {
      console.warn(`${libName}: Отсутствует название метода`);
      return;
    }

    const methodName = methodArgs[0];

    if (typeof methodName !== 'string') {
      console.warn(`${libName}: Название метода должно быть строкой`);
      return;
    }

    try {
      (window as any).ym(targetCounterId, ...methodArgs);
    } catch (error) {
      console.error(`${libName}: Ошибка вызова метода: `, error, {
        counterId: targetCounterId,
        methodArgs,
      });
    }
  }

  private isCounterName(name: string): boolean {
    return this.#configs?.some((config) => config.name === name) ?? false;
  }

  private getCounterIdByName(name: string): number | undefined {
    return this.#configs?.find((config) => config.name === name)?.id;
  }

  private canExecute(counterIdOrName?: string | number): boolean {
    if (!this.#isBrowser || typeof (window as any).ym !== 'function') return false;

    if (!this.#configs || this.#configs.length === 0) {
      console.warn(`${libName}: Не настроены счетчики`);
      return false;
    }

    if (counterIdOrName !== undefined) {
      const config = this.getCounterConfig(counterIdOrName);

      if (!config) {
        const availableCounters = this.#configs
          .map((c) => (c.name ? `${c.name} (${c.id})` : c.id.toString()))
          .join(', ');
        console.warn(
          `${libName}: Счетчик "${counterIdOrName}" не найден. Доступные: ${availableCounters}`,
        );
        return false;
      }

      return !!config.id && (!config.prodOnly || !isDevMode());
    }

    if (!this.#defaultConfig) {
      console.warn(`${libName}: Не настроен счетчик по умолчанию`);
      return false;
    }

    return !!this.#defaultConfig.id && (!this.#defaultConfig.prodOnly || !isDevMode());
  }

  private getCounterConfig(counterIdOrName: string | number): YMConfig | undefined {
    if (!this.#configs) return undefined;

    if (typeof counterIdOrName === 'number') {
      return this.#configs.find((config) => config.id === counterIdOrName);
    } else {
      return this.#configs.find((config) => config.name === counterIdOrName);
    }
  }
}
