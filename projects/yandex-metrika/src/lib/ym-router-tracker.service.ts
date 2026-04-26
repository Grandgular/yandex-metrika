import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { YM_ROUTER_OPTIONS } from './ym-router-options';
import { YMService } from './ym-service';

/**
 * Подписка на `Router.events` и отправка virtual pageview через {@link YMService.hit}
 * (см. {@link provideYandexMetrikaRouter}).
 *
 * @internal
 */
@Injectable()
export class YandexMetrikaRouterTracker implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly ym = inject(YMService);
  private readonly title = inject(Title);
  private readonly config = inject(YM_ROUTER_OPTIONS);

  private sub?: Subscription;
  private initialEventHandled = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        if (this.config.ignoreInitialNavigation && !this.initialEventHandled) {
          this.initialEventHandled = true;
          return;
        }
        this.initialEventHandled = true;

        const url = e.urlAfterRedirects;
        if (this.config.includePageTitle) {
          this.ym.hit(url, { title: this.title.getTitle() });
          return;
        }

        this.ym.hit(url);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
