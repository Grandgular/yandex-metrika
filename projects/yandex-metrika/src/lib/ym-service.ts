import { Injectable, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YM_CONFIG_TOKEN, YM_DEFAULT_CONFIG_TOKEN } from './ym-config-token';
import { YMConfig } from './ym-config-interface';
import { libName } from './ym-lib-name';
import { YMMethod } from './ym-method-enum';
import { KNOWN_METHODS, KnownMethodArgs, YMMethodType } from './ym-method-args-type';

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
 * // Основные сценарии использования
 * trackPageView() {
 *   this.metrika.execute(YMMethod.Hit, '/page-url');
 * }
 *
 * trackGoal() {
 *   this.metrika.execute('reachGoal', 'purchase', { order_price: 1000 });
 * }
 *
 * trackWithCustomCounter() {
 *   this.metrika.executeWithCounter('secondary', YMMethod.Hit, '/page');
 * }
 *
 * // Chaining примеры
 * trackUserJourney() {
 *   this.metrika
 *     .execute(YMMethod.Hit, '/page')
 *     .execute('reachGoal', 'view')
 *     .execute(YMMethod.SetUserID, 'user-123');
 * }
 *
 * @remarks
 * - 🛡️ Полная типобезопасность с автодополнением
 * - 🔧 Поддержка как enum, так и строковых литералов
 * - 🎯 Работа с одним или несколькими счетчиками
 * - 🌐 SSR-совместимость (Angular Universal)
 * - 🚀 Production-оптимизации
 * - ⚡ Автоматические проверки окружения
 * - 📝 Предупреждения о возможных опечатках
 * - ⛓️ Chaining поддержка для группировки вызовов
 *
 * @see YMConfig - Конфигурация счетчиков
 * @see provideYandexMetrika - Настройка провайдеров
 * @see YMMethod - Enum доступных методов API
 */
@Injectable({ providedIn: 'root' })
export class YMService {
  readonly #configs = inject(YM_CONFIG_TOKEN, { optional: true });
  readonly #defaultConfig = inject(YM_DEFAULT_CONFIG_TOKEN, { optional: true });
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

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
