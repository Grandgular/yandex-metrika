import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
// import { provideYandexMetrika } from '@grandgular/yandex-metrika';
import { provideYandexMetrika } from '../../../yandex-metrika/src/lib/ym-provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    // Режим deferred для демонстрации отложенной инициализации
    provideYandexMetrika(
      {
        id: 104120889,
        includeNoscriptFallback: false,
        options: {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
          ecommerce: 'dataLayer',
        },
      },
      { initialization: 'deferred' },
    ),
  ],
};
