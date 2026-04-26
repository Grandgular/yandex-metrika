import { TestBed } from '@angular/core/testing';
import { YM_CONFIG_TOKEN, YM_DEFAULT_CONFIG_TOKEN } from './ym-config-token';
import { provideYandexMetrika } from './ym-provider';
import { provideYandexMetrikaRouter } from './ym-router-provider';
import { YandexMetrikaRouterTracker } from './ym-router-tracker.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

describe('provideYandexMetrika', () => {
  it('deferred: регистрирует массив конфигов и default-счётчик', () => {
    TestBed.configureTestingModule({
      providers: [provideYandexMetrika([{ id: 11, name: 'a', default: true }], { initialization: 'deferred' })],
    });
    const configs = TestBed.inject(YM_CONFIG_TOKEN);
    expect(configs.length).toBe(1);
    expect(TestBed.inject(YM_DEFAULT_CONFIG_TOKEN)?.id).toBe(11);
  });
});

describe('provideYandexMetrikaRouter', () => {
  it('создаёт YandexMetrikaRouterTracker (вместе с provideYandexMetrika + mock Router)', () => {
    const ev = new Subject<unknown>();
    TestBed.configureTestingModule({
      providers: [
        provideYandexMetrika(
          { id: 1, name: 'm', default: true, prodOnly: false },
          { initialization: 'deferred' },
        ),
        provideYandexMetrikaRouter(),
        { provide: Router, useValue: { events: ev.asObservable() } },
        { provide: Title, useValue: { getTitle: () => 'T' } },
      ],
    });
    const tracker = TestBed.inject(YandexMetrikaRouterTracker);
    expect(tracker).toBeTruthy();
  });
});
