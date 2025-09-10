import { Injectable, PLATFORM_ID, inject, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { YM_CONFIG_TOKEN } from './ym-config-token';
import { YMConfig } from './ym-interfaces';

@Injectable({ providedIn: 'root' })
export class YMService {
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #config = inject(YM_CONFIG_TOKEN, { optional: true });
  readonly #metrika: any = null;

  public initialize(config: YMConfig): void {
    this.loadScript(config);
  }

  public reachGoal(goal: string, params: any): void {
    if (!this.isEnabled()) return;

    console.log('reach goal: ', goal);
  }

  private isEnabled(): boolean {
    return this.#isBrowser && !!this.#config && (!this.#config.init?.prodOnly || !isDevMode());
  }

  private loadScript(config: YMConfig): void {
    console.log('loadScript');
  }
}
