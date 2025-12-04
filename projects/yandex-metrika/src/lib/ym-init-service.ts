import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { YMConfig } from './ym-config-interface';
import { libName } from './ym-lib-name';

@Injectable({ providedIn: 'root' })
export class YMInitService {
  readonly #document = inject(DOCUMENT);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #defaultScriptUrl = 'https://mc.yandex.ru/metrika/tag.js';

  public initialize(config: YMConfig): void {
    if (!this.canInit(config)) return;

    this.loadScript(config);
    this.addNoscriptFallback(config.id);
  }

  private canInit(config: YMConfig): boolean {
    return this.#isBrowser && !!config && !!config.id && (!config?.prodOnly || !isDevMode());
  }

  private loadScript(config: YMConfig): void {
    this.initializeYMQueue();

    const script = this.#document.createElement('script');
    script.src = config?.alternativeScriptUrl || this.#defaultScriptUrl;
    script.async = config.loading === 'async';
    script.defer = config.loading === 'defer';

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
