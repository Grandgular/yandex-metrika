import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { YMConfig } from './ym-config-interface';
import { libName } from './ym-lib-name';
import { YM_CONFIG_TOKEN } from './ym-config-token';

@Injectable({ providedIn: 'root' })
export class YMInitService {
  readonly #document = inject(DOCUMENT);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #configs = inject(YM_CONFIG_TOKEN, { optional: true });
  readonly #defaultScriptUrl = 'https://mc.yandex.ru/metrika/tag.js';
  readonly #initializedCounterIds = new Set<number>();

  /**
   * Инициализирует все счётчики из конфигурации {@link provideYandexMetrika}.
   * Идемпотентен: повторные вызовы для одного и того же `id` игнорируются.
   *
   * Используйте при `initialization: 'deferred'` после получения согласия пользователя.
   */
  public initializeAll(): void {
    if (!this.#isBrowser) return;

    const configs = this.#configs;
    if (!configs?.length) {
      console.warn(`${libName}: Нет конфигурации счётчиков для initializeAll()`);
      return;
    }

    configs.forEach((config) => this.initialize(config));
  }

  public initialize(config: YMConfig): void {
    if (!this.canInit(config)) return;

    if (this.#initializedCounterIds.has(config.id)) return;

    this.loadScript(config);
    if (config.includeNoscriptFallback !== false) {
      this.addNoscriptFallback(config.id);
    }

    this.#initializedCounterIds.add(config.id);
  }

  private canInit(config: YMConfig): boolean {
    return this.#isBrowser && !!config && !!config.id && (!config?.prodOnly || !isDevMode());
  }

  private loadScript(config: YMConfig): void {
    this.initializeYMQueue();

    const script = this.#document.createElement('script');
    script.src = config?.alternativeScriptUrl || this.#defaultScriptUrl;
    
    const loading = config.loading ?? 'async';
    script.async = loading === 'async';
    script.defer = loading === 'defer';

    (window as any).ym(config.id, 'init', config.options);

    script.onload = () =>
      console.log(`${libName}: Скрипт для счетчика ${config.id} успешно загружен`);
    script.onerror = (error) =>
      console.error(`${libName}: Не удалось загрузить скрипт для счетчика ${config.id}: `, error);

    this.#document.head.appendChild(script);
  }

  private addNoscriptFallback(id: number): void {
    const noscript = this.#document.createElement('noscript');
    const div = this.#document.createElement('div');
    const img = this.#document.createElement('img');

    img.src = `https://mc.yandex.ru/watch/${id}`;
    img.style.position = 'absolute';
    img.style.left = '-9999px';
    img.alt = '';

    div.appendChild(img);
    noscript.appendChild(div);
    this.#document.body.appendChild(noscript);
  }

  private initializeYMQueue(): void {
    if ((window as any).ym) return;

    (window as any).ym = function (...args: any[]) {
      ((window as any).ym.a = (window as any).ym.a || []).push(args);
    };
    (window as any).ym.l = new Date().getTime();
  }
}
