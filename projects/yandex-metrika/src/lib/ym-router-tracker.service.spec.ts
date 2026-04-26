import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { YM_DEFAULT_CONFIG_TOKEN, YM_CONFIG_TOKEN } from './ym-config-token';
import { YM_DEFAULT_ROUTER_OPTIONS, YM_ROUTER_OPTIONS } from './ym-router-options';
import { YandexMetrikaRouterTracker } from './ym-router-tracker.service';
import { YMService } from './ym-service';

describe('YandexMetrikaRouterTracker', () => {
  const defaultConfig = { id: 9001, name: 'm', default: true, prodOnly: false as const };
  let events$: Subject<unknown>;
  let ymMock: jasmine.Spy;
  const originalYm = (globalThis as unknown as { ym?: unknown }).ym;
  const titleGetTitle = jasmine.createSpy('getTitle').and.returnValue('TestTitle');

  beforeEach(() => {
    events$ = new Subject();
    ymMock = jasmine.createSpy('ym');
    (globalThis as unknown as { ym: typeof ymMock }).ym = ymMock;
    TestBed.configureTestingModule({
      providers: [
        { provide: YM_CONFIG_TOKEN, useValue: [defaultConfig] },
        { provide: YM_DEFAULT_CONFIG_TOKEN, useValue: defaultConfig },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { events: events$.asObservable() } },
        { provide: Title, useValue: { getTitle: titleGetTitle } },
        {
          provide: YM_ROUTER_OPTIONS,
          useValue: { ...YM_DEFAULT_ROUTER_OPTIONS },
        },
        YMService,
        YandexMetrikaRouterTracker,
      ],
    });
  });

  afterEach(() => {
    if (originalYm === undefined) {
      delete (globalThis as unknown as { ym?: unknown }).ym;
    } else {
      (globalThis as unknown as { ym: unknown }).ym = originalYm;
    }
  });

  it('первый NavigationEnd пропускается при ignoreInitialNavigation: true', () => {
    TestBed.inject(YandexMetrikaRouterTracker);
    events$.next(new NavigationEnd(0, '/a', '/a'));
    expect(ymMock).not.toHaveBeenCalled();
  });

  it('второй NavigationEnd вызывает hit с url и title', () => {
    TestBed.inject(YandexMetrikaRouterTracker);
    events$.next(new NavigationEnd(0, '/a', '/a'));
    events$.next(new NavigationEnd(1, '/a', '/b'));
    expect(ymMock).toHaveBeenCalledWith(
      9001,
      'hit',
      '/b',
      jasmine.objectContaining({ title: 'TestTitle' }),
    );
  });

  it('с ignoreInitialNavigation: false с первого события шлёт hit', () => {
    TestBed.resetTestingModule();
    events$ = new Subject();
    ymMock = jasmine.createSpy('ym');
    (globalThis as unknown as { ym: typeof ymMock }).ym = ymMock;
    TestBed.configureTestingModule({
      providers: [
        { provide: YM_CONFIG_TOKEN, useValue: [defaultConfig] },
        { provide: YM_DEFAULT_CONFIG_TOKEN, useValue: defaultConfig },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { events: events$.asObservable() } },
        { provide: Title, useValue: { getTitle: titleGetTitle } },
        {
          provide: YM_ROUTER_OPTIONS,
          useValue: { ignoreInitialNavigation: false, includePageTitle: true },
        },
        YMService,
        YandexMetrikaRouterTracker,
      ],
    });
    TestBed.inject(YandexMetrikaRouterTracker);
    events$.next(new NavigationEnd(0, '/a', '/a'));
    expect(ymMock).toHaveBeenCalled();
  });

  it('с includePageTitle: false hit без поля title', () => {
    TestBed.resetTestingModule();
    events$ = new Subject();
    ymMock = jasmine.createSpy('ym');
    (globalThis as unknown as { ym: typeof ymMock }).ym = ymMock;
    TestBed.configureTestingModule({
      providers: [
        { provide: YM_CONFIG_TOKEN, useValue: [defaultConfig] },
        { provide: YM_DEFAULT_CONFIG_TOKEN, useValue: defaultConfig },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: { events: events$.asObservable() } },
        { provide: Title, useValue: { getTitle: titleGetTitle } },
        {
          provide: YM_ROUTER_OPTIONS,
          useValue: { ignoreInitialNavigation: true, includePageTitle: false },
        },
        YMService,
        YandexMetrikaRouterTracker,
      ],
    });
    TestBed.inject(YandexMetrikaRouterTracker);
    events$.next(new NavigationEnd(0, '/a', '/a'));
    events$.next(new NavigationEnd(1, '/a', '/b'));
    expect(ymMock).toHaveBeenCalledWith(9001, 'hit', '/b');
  });

  it('ngOnDestroy отписывается', () => {
    const tracker = TestBed.inject(YandexMetrikaRouterTracker);
    events$.next(new NavigationEnd(0, '/a', '/a'));
    events$.next(new NavigationEnd(1, '/a', '/b'));
    ymMock.calls.reset();
    tracker.ngOnDestroy();
    events$.next(new NavigationEnd(2, '/b', '/c'));
    expect(ymMock).not.toHaveBeenCalled();
  });
});
