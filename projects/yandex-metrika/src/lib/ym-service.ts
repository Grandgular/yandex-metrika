import { Injectable, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YM_CONFIG_TOKEN, YM_DEFAULT_CONFIG_TOKEN } from './ym-config-token';
import { YMConfig } from './ym-config-interface';
import { libName } from './ym-lib-name';
import { YMMethod } from './ym-method-enum';
import { KNOWN_METHODS, KnownMethodArgs, YMMethodArgs, YMMethodType } from './ym-method-args-type';
import { YMEcommerceService } from './ym-ecommerce/ym-ecommerce-service';

/**
 * Сервис для типобезопасной работы с Яндекс.Метрикой в Angular приложениях
 *
 * Предоставляет современный API для взаимодействия с API Яндекс.Метрики с полной TypeScript поддержкой,
 * проверкой типов и автодополнением. Поддерживает все методы API, работу с несколькими счетчиками
 * и различные сценарии использования.
 *
 * @example
 * // Внедрение сервиса
 * private metrika = inject(YMService);
 *
 * // Базовые сценарии использования
 * trackPageView() {
 *   this.metrika.hit('/page-url');
 * }
 *
 * trackGoal() {
 *   this.metrika.reachGoal('purchase', { order_price: 1000 });
 * }
 *
 * trackUser() {
 *   this.metrika.setUserID('user-123');
 * }
 *
 * // Работа с несколькими счетчиками
 * trackWithCustomCounter() {
 *   this.metrika.hitWithCounter('secondary', '/page');
 * }
 *
 * // Универсальные методы для произвольных вызовов
 * customTracking() {
 *   this.metrika.execute('customMethod', 'data');
 *   this.metrika.executeWithCounter('analytics', YMMethod.Hit, '/page');
 * }
 *
 * // Chaining примеры
 * trackUserJourney() {
 *   this.metrika
 *     .hit('/page')
 *     .reachGoal('view')
 *     .setUserID('user-123');
 * }
 *
 * @remarks
 * - 🛡️ Полная типобезопасность с автодополнением для всех методов API
 * - 🔧 Поддержка как enum (YMMethod), так и строковых литералов
 * - 🎯 Работа с одним или несколькими счетчиками
 * - 🌐 SSR-совместимость (Angular Universal)
 * - 🚀 Production-оптимизации (prodOnly флаг)
 * - ⚡ Автоматические проверки окружения (браузер, доступность API)
 * - 📝 Предупреждения о возможных опечатках в названиях методов
 * - ⛓️ Chaining поддержка для группировки вызовов
 * - 📚 Специализированные методы для каждого API вызова Яндекс.Метрики
 * - 🔄 Универсальные методы execute() и executeWithCounter() для гибкости
 *
 * ## Уровни доступа к API:
 *
 * ### 1. Специализированные методы (рекомендуется)
 * Полностью типобезопасные методы для каждого API вызова:
 * - `hit()`, `reachGoal()`, `setUserID()` и другие
 * - `methodNameWithCounter()` версии для конкретных счетчиков
 *
 * ### 2. Универсальные методы (для продвинутых сценариев)
 * Гибкие методы для произвольных вызовов:
 * - `execute(method, ...args)` - для счетчика по умолчанию
 * - `executeWithCounter(counter, method, ...args)` - для указанного счетчика
 *
 * ### 3. Низкоуровневый метод (устаревший)
 * - `ym()` - прямой вызов API (deprecated, будет удален в будущих версиях)
 *
 * @see YMConfig - Конфигурация счетчиков
 * @see provideYandexMetrika - Настройка провайдеров
 * @see YMMethod - Enum доступных методов API
 * @see YMMethodArgs - Типы аргументов для всех методов
 *
 * @publicApi
 */
@Injectable({ providedIn: 'root' })
export class YMService {
  readonly #configs = inject(YM_CONFIG_TOKEN, { optional: true });
  readonly #defaultConfig = inject(YM_DEFAULT_CONFIG_TOKEN, { optional: true });
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ====================== ECOMMERCE СЕРВИС ======================

  public readonly ecommerce = inject(YMEcommerceService);

  // ==================== УНИВЕРСАЛЬНЫЕ МЕТОДЫ ====================

  /**
   * Универсальный метод для вызова любого метода API Яндекс.Метрики.
   * @deprecated Станет приватным в следующей мажорной версии. Используйте типобезопасные методы execute и executeWithCounter.
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

  /**
   * Типобезопасный вызов метода API для счетчика по умолчанию
   *
   * Поддерживает все методы Яндекс.Метрики с полной проверкой типов аргументов.
   * При использовании неизвестных методов выводит предупреждение в консоль.
   *
   * @param method - Название метода (enum, строковый литерал или произвольная строка)
   * @param args - Аргументы метода с типобезопасностью для известных методов
   * @returns this для поддержки chaining
   *
   * @example
   * // Использование enum (рекомендуется)
   * this.metrika.execute(YMMethod.Hit, '/page');
   *
   * // Использование строкового литерала
   * this.metrika.execute('reachGoal', 'purchase', { order_price: 1000 });
   *
   * // Произвольный метод (с предупреждением)
   * this.metrika.execute('customMethod', 'data');
   *
   * // Chaining
   * this.metrika
   *   .execute(YMMethod.Hit, '/page')
   *   .execute('reachGoal', 'view')
   *   .execute(YMMethod.SetUserID, 'user-123');
   */
  public execute<T extends YMMethodType>(method: T, ...args: KnownMethodArgs<T>): this {
    this.validateMethod(method);
    this.ym(method as any, ...args);
    return this;
  }

  /**
   * Типобезопасный вызов метода API для указанного счетчика
   *
   * Аналогично методу execute, но позволяет явно указать целевой счетчик
   * по его ID или имени.
   *
   * @param counterIdOrName - ID счетчика или его имя из конфигурации
   * @param method - Название метода (enum, строковый литерал или произвольная строка)
   * @param args - Аргументы метода с типобезопасностью для известных методов
   * @returns this для поддержки chaining
   *
   * @example
   * // По ID счетчика
   * this.metrika.executeWithCounter(1234567, YMMethod.Hit, '/page');
   *
   * // По имени счетчика
   * this.metrika.executeWithCounter('secondary', 'reachGoal', 'signup');
   *
   * // Chaining
   * this.metrika
   *   .executeWithCounter('main', YMMethod.Hit, '/page')
   *   .executeWithCounter('secondary', YMMethod.ReachGoal, 'conversion');
   */
  public executeWithCounter<T extends YMMethodType>(
    counterIdOrName: number | string,
    method: T,
    ...args: KnownMethodArgs<T>
  ): this {
    this.validateMethod(method);
    this.ym(counterIdOrName, method as any, ...args);
    return this;
  }

  // ==================== СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ ====================

  /**
   * Добавить поддержку расширения файла
   * @see https://yandex.ru/support/metrica/ru/objects/addfileextension
   */
  public addFileExtension(...args: YMMethodArgs[YMMethod.AddFileExtension]): this {
    return this.execute(YMMethod.AddFileExtension, ...args);
  }

  /**
   * Добавить поддержку расширения файла (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/addfileextension
   */
  public addFileExtensionWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.AddFileExtension]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.AddFileExtension, ...args);
  }

  /**
   * Отправка информации о переходе по внешней ссылке
   * @see https://yandex.ru/support/metrica/ru/objects/extlink
   */
  public extLink(...args: YMMethodArgs[YMMethod.ExtLink]): this {
    return this.execute(YMMethod.ExtLink, ...args);
  }

  /**
   * Отправка информации о переходе по внешней ссылке (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/extlink
   */
  public extLinkWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.ExtLink]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.ExtLink, ...args);
  }

  /**
   * Отправка информации о загрузке файла
   * @see https://yandex.ru/support/metrica/ru/objects/file
   */
  public file(...args: YMMethodArgs[YMMethod.File]): this {
    return this.execute(YMMethod.File, ...args);
  }

  /**
   * Отправка информации о загрузке файла (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/file
   */
  public fileWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.File]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.File, ...args);
  }

  /**
   * Отправка контактной информации посетителей сайта
   * @see https://yandex.ru/support/metrica/ru/objects/first-party-params
   */
  public firstPartyParams(...args: YMMethodArgs[YMMethod.FirstPartyParams]): this {
    return this.execute(YMMethod.FirstPartyParams, ...args);
  }

  /**
   * Отправка контактной информации посетителей сайта (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/first-party-params
   */
  public firstPartyParamsWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.FirstPartyParams]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.FirstPartyParams, ...args);
  }

  /**
   * Отправка контактной информации посетителей сайта с возможностью самостоятельного хеширования данных
   * @see https://yandex.ru/support/metrica/ru/objects/first-party-params-hash
   */
  public firstPartyParamsHashed(...args: YMMethodArgs[YMMethod.FirstPartyParamsHashed]): this {
    return this.execute(YMMethod.FirstPartyParamsHashed, ...args);
  }

  /**
   * Отправка контактной информации посетителей сайта с возможностью самостоятельного хеширования данных (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/first-party-params-hash
   */
  public firstPartyParamsHashedWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.FirstPartyParamsHashed]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.FirstPartyParamsHashed, ...args);
  }

  /**
   * Получение идентификатора посетителя, заданного Метрикой
   * @see https://yandex.ru/support/metrica/ru/objects/get-client-id
   */
  public getClientID(...args: YMMethodArgs[YMMethod.GetClientID]): this {
    return this.execute(YMMethod.GetClientID, ...args);
  }

  /**
   * Получение идентификатора посетителя, заданного Метрикой (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/get-client-id
   */
  public getClientIDWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.GetClientID]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.GetClientID, ...args);
  }

  /**
   * Отправка вручную данных о просмотрах для AJAX- и Flash-сайтов
   * @see https://yandex.ru/support/metrica/ru/objects/hit
   */
  public hit(...args: YMMethodArgs[YMMethod.Hit]): this {
    return this.execute(YMMethod.Hit, ...args);
  }

  /**
   * Отправка вручную данных о просмотрах для AJAX- и Flash-сайтов (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/hit
   */
  public hitWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.Hit]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.Hit, ...args);
  }

  /**
   * Передача информации о том, что визит пользователя не является отказом
   * @see https://yandex.ru/support/metrica/ru/objects/notbounce
   */
  public notBounce(...args: YMMethodArgs[YMMethod.NotBounce]): this {
    return this.execute(YMMethod.NotBounce, ...args);
  }

  /**
   * Передача информации о том, что визит пользователя не является отказом (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/notbounce
   */
  public notBounceWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.NotBounce]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.NotBounce, ...args);
  }

  /**
   * Дополнительный способ передачи пользовательских параметров в отчет Параметры визитов
   * @see https://yandex.ru/support/metrica/ru/objects/params-method
   */
  public params(...args: YMMethodArgs[YMMethod.Params]): this {
    return this.execute(YMMethod.Params, ...args);
  }

  /**
   * Дополнительный способ передачи пользовательских параметров в отчет Параметры визитов (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/params-method
   */
  public paramsWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.Params]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.Params, ...args);
  }

  /**
   * Достижение цели
   * @see https://yandex.ru/support/metrica/ru/objects/reachgoal
   */
  public reachGoal(...args: YMMethodArgs[YMMethod.ReachGoal]): this {
    return this.execute(YMMethod.ReachGoal, ...args);
  }

  /**
   * Достижение цели (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/reachgoal
   */
  public reachGoalWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.ReachGoal]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.ReachGoal, ...args);
  }

  /**
   * Передача идентификатора посетителя, заданного владельцем сайта
   * @see https://yandex.ru/support/metrica/ru/objects/set-user-id
   */
  public setUserID(...args: YMMethodArgs[YMMethod.SetUserID]): this {
    return this.execute(YMMethod.SetUserID, ...args);
  }

  /**
   * Передача идентификатора посетителя, заданного владельцем сайта (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/set-user-id
   */
  public setUserIDWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.SetUserID]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.SetUserID, ...args);
  }

  /**
   * Способ передачи пользовательских параметров в отчет Параметры посетителей
   * @see https://yandex.ru/support/metrica/ru/objects/user-params
   */
  public userParams(...args: YMMethodArgs[YMMethod.UserParams]): this {
    return this.execute(YMMethod.UserParams, ...args);
  }

  /**
   * Способ передачи пользовательских параметров в отчет Параметры посетителей (для конкретного счетчика)
   * @see https://yandex.ru/support/metrica/ru/objects/user-params
   */
  public userParamsWithCounter(
    counterIdOrName: number | string,
    ...args: YMMethodArgs[YMMethod.UserParams]
  ): this {
    return this.executeWithCounter(counterIdOrName, YMMethod.UserParams, ...args);
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  /**
   * Проверяет метод и выводит предупреждение если метод неизвестен
   */
  private validateMethod(method: YMMethodType): void {
    if (typeof method !== 'string') return;

    const methodName = method as string;

    if (!KNOWN_METHODS.has(methodName as YMMethod)) {
      console.warn(
        `${libName}: Вызывается неизвестный метод "${methodName}". ` +
          `Возможна опечатка. Доступные методы: ${Array.from(KNOWN_METHODS).join(', ')}`,
      );
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
