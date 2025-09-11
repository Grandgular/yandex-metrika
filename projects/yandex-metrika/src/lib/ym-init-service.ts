import { Injectable, PLATFORM_ID, inject, isDevMode, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YMConfig } from './ym-config-interface';

@Injectable({ providedIn: 'root' })
export class YMInitService {
  readonly #document = inject(DOCUMENT);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #scriptSrc = 'https://mc.yandex.ru/metrika/tag.js';

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

    script.src = this.#scriptSrc;
    script.async = config.loading === 'async';
    script.defer = config.loading === 'defer';

    (window as any).ym(config.id, 'init', config.options);

    script.onload = () => console.log('YM script loaded');
    script.onerror = (error) => console.error('YM script failed:', error);

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
