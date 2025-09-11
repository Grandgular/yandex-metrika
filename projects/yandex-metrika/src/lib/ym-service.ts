import { Injectable, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YM_CONFIG_TOKEN } from './ym-config-token';

/**
 * Main service for interacting with Yandex Metrika API in Angular applications.
 *
 * Provides a type-safe wrapper around the global `ym` function with automatic
 * configuration handling, error protection, and environment checks.
 *
 * @example
 * // Inject and use in components
 * constructor(private ym: YMService) {}
 *
 * trackEvent() {
 *   this.ym('reachGoal', 'purchase', { amount: 100 });
 * }
 *
 * @remarks
 * - Automatically handles configuration injection
 * - Performs environment checks (browser, production mode)
 * - Provides error handling and warnings
 * - Supports both explicit and implicit counter ID usage
 *
 * @see YMConfig - For configuration options
 * @see provideYandexMetrika - For provider setup
 */
@Injectable({ providedIn: 'root' })
export class YMService {
  readonly #config = inject(YM_CONFIG_TOKEN, { optional: true });
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Universal method for calling any Yandex Metrika API function.
   *
   * Automatically handles counter ID injection and provides error protection.
   * Can be used with or without explicit counter ID parameter.
   *
   * @param args - Arguments to pass to the Yandex Metrika API.
   * If the first argument is a number or string, it's treated as an explicit counter ID.
   * Otherwise, the configured counter ID will be automatically prepended.
   *
   * @example
   * // Using configured ID automatically
   * ym('reachGoal', 'signup', { plan: 'premium' });
   *
   * @example
   * // Using explicit counter ID
   * ym(123456, 'hit', '/homepage');
   *
   * @example
   * // E-commerce methods
   * ym('ecommerce.addProduct', { id: 'prod1', name: 'Product', price: 100 });
   *
   * @throws Logs warnings and errors to console but doesn't throw exceptions
   *
   * @see https://yandex.com/support/metrica/js-api.html - For complete API reference
   */
  public ym(...args: unknown[]): void {
    if (!this.canExecute()) return;

    const firstArg = args[0];
    const isFirstArgId = typeof firstArg === 'number';

    if (isFirstArgId && args.length < 2) {
      console.warn('@grandgular/yandex-metrika: Missing method name when ID provided');
      return;
    }

    if (!isFirstArgId && args.length < 1) {
      console.warn('@grandgular/yandex-metrika: Missing method name');
      return;
    }

    const finalArgs = isFirstArgId ? args : [this.#config!.id, ...args];

    try {
      (window as any).ym(...finalArgs);
    } catch (error) {
      console.error('@grandgular/yandex-metrika: Method call failed:', error);
    }
  }

  private canExecute(): boolean {
    return (
      this.#isBrowser &&
      !!this.#config &&
      !!this.#config.id &&
      (!this.#config?.prodOnly || !isDevMode()) &&
      typeof (window as any).ym === 'function'
    );
  }

  // public reachGoal(
  //   goalName: string,
  //   params?: Record<string, any>,
  //   callback?: () => void,
  //   ctx?: any,
  // ): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'reachGoal', goalName, params, callback, ctx);
  // }
  //
  // public hit(url: string, title?: string, referer?: string): void {
  //   if (!this.canExecute()) return;
  //
  //   const options: any = {};
  //   if (title) options.title = title;
  //   if (referer) options.referer = referer;
  //
  //   (window as any).ym(this.#config!.id, 'hit', url, options);
  // }
  //
  // public params(params: Record<string, any>, callback?: () => void, ctx?: any): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'params', params, callback, ctx);
  // }
  //
  // public userParams(params: Record<string, any>): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'userParams', params);
  // }
  //
  // public file(url: string, callback?: () => void, ctx?: any): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'file', url, callback, ctx);
  // }
  //
  // public extLink(url: string, callback?: () => void, ctx?: any): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'extLink', url, callback, ctx);
  // }
  //
  // public notBounce(callback?: () => void, ctx?: any): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'notBounce', callback, ctx);
  // }
  //
  // public setUserID(userId: string | number): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'setUserID', userId);
  // }
  //
  // public getClientID(callback: (clientID: string) => void): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'getClientID', callback);
  // }
  //
  // public addFileExtension(extensions: string | string[]): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'addFileExtension', extensions);
  // }
  //
  // public ecommerceAddProduct(product: any): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'ecommerce.addProduct', product);
  // }
  //
  // public ecommercePurchase(order: any): void {
  //   if (!this.canExecute()) return;
  //
  //   (window as any).ym(this.#config!.id, 'ecommerce.purchase', order);
  // }
  //
  // public getCounterId(): number | null {
  //   return this.#config?.id || null;
  // }
}
