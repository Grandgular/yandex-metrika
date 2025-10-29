import { DOCUMENT, inject, Injectable, isDevMode, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YMConfig } from './ym-config-interface';
import { libName } from './ym-lib-name';
import { YMEcommerceService } from './ym-ecommerce/ym-ecommerce-service';

@Injectable({ providedIn: 'root' })
export class YMInitService {
  readonly #document = inject(DOCUMENT);
  readonly #ecommerce = inject(YMEcommerceService);

  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly #defaultScriptUrl = 'https://mc.yandex.ru/metrika/tag.js';
  readonly #initialized = signal(false);
  readonly #loadedScripts = signal<number[]>([]);

  public initialize(config: YMConfig, isDefault = false): void {
    if (!this.canInit(config)) return;
    if (config.options?.ecommerce)
      this.initializeEcommerceDataLayer(config.options.ecommerce, isDefault);
    if (!this.#initialized()) {
      this.loadScript(config);
      this.#initialized.set(true);
    }
    this.initializeCounter(config);
    this.addNoscriptFallback(config.id);
  }

  private initializeCounter(config: YMConfig): void {
    this.initializeYMQueue();

    (window as any).ym(config.id, 'init', config.options);

    this.#loadedScripts.update((scripts) => [...scripts, config.id]);

    console.log(`${libName}: Счетчик ${config.id} инициализирован`);
  }

  private loadScript(config: YMConfig): void {
    const script = this.#document.createElement('script');
    script.src = config?.alternativeScriptUrl || this.#defaultScriptUrl;
    script.async = config.loading === 'async';
    script.defer = config.loading === 'defer';

    script.onload = () => {
      console.log(`${libName}: Скрипт Яндекс.Метрики успешно загружен`);
      console.log(`${libName}: Инициализировано счетчиков: ${this.#loadedScripts().length}`);
    };

    script.onerror = (error) =>
      console.error(`${libName}: Не удалось загрузить скрипт Яндекс.Метрики: `, error);

    this.#document.head.appendChild(script);
  }

  private initializeEcommerceDataLayer(
    ecommerce: boolean | string | any[],
    isDefault = false,
  ): void {
    let dataLayerName: string;

    if (ecommerce === true) {
      dataLayerName = this.#ecommerce.defaultDataLayerName;
    } else if (typeof ecommerce === 'string' && ecommerce.trim().length > 0) {
      dataLayerName = ecommerce.trim();
    } else if (Array.isArray(ecommerce)) {
      console.warn(`${libName}: Массив для ecommerce пока не поддерживается`);
      return;
    } else {
      console.warn(`${libName}: Неверный формат ecommerce:`, ecommerce);
      return;
    }

    if (this.#ecommerce.initializedDataLayers().includes(dataLayerName)) {
      console.warn(`${libName}: DataLayer "${dataLayerName}" для ecommerce уже инициализирован`);
      return;
    }

    if (!Array.isArray((window as any)[dataLayerName])) {
      (window as any)[dataLayerName] = [];
      console.log(`${libName}: DataLayer "${dataLayerName}" создан для ecommerce`);
    } else {
      console.log(`${libName}: DataLayer "${dataLayerName}" уже существует`);
    }

    if (isDefault) this.#ecommerce.defaultDataLayer.set(dataLayerName);
    this.#ecommerce.initializedDataLayers.update((layers) => [...layers, dataLayerName]);
  }

  private canInit(config: YMConfig): boolean {
    return this.#isBrowser && !!config && !!config.id && (!config?.prodOnly || !isDevMode());
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
