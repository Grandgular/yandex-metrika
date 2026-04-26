import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { YM_DEFAULT_CONFIG_TOKEN, YM_CONFIG_TOKEN } from './ym-config-token';
import { YMService } from './ym-service';
import { YMMethod } from './ym-method-enum';

describe('YMService', () => {
  const defaultConfig = { id: 1001, name: 'main', default: true, prodOnly: false as const };
  let ymMock: jasmine.Spy;
  const originalYm = (globalThis as unknown as { ym?: unknown }).ym;

  beforeEach(() => {
    ymMock = jasmine.createSpy('ym');
    (globalThis as unknown as { ym: typeof ymMock }).ym = ymMock;
  });

  afterEach(() => {
    if (originalYm === undefined) {
      delete (globalThis as unknown as { ym?: unknown }).ym;
    } else {
      (globalThis as unknown as { ym: unknown }).ym = originalYm;
    }
  });

  function makeModule(platformId: string) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: YM_CONFIG_TOKEN, useValue: [defaultConfig] },
        { provide: YM_DEFAULT_CONFIG_TOKEN, useValue: defaultConfig },
        { provide: PLATFORM_ID, useValue: platformId },
        YMService,
      ],
    });
    return TestBed.inject(YMService);
  }

  it('создаётся', () => {
    const service = makeModule('browser');
    expect(service).toBeTruthy();
  });

  it('на SSR не вызывает window.ym', () => {
    const service = makeModule('server');
    service.hit('/p');
    expect(ymMock).not.toHaveBeenCalled();
  });

  it('для default-счётчика вызывает ym(id, method, ...args) для hit', () => {
    const service = makeModule('browser');
    service.hit('/path', { title: 'P' });
    expect(ymMock).toHaveBeenCalledWith(1001, 'hit', '/path', jasmine.objectContaining({ title: 'P' }));
  });

  it('для reachGoal передаёт имя и параметры', () => {
    const service = makeModule('browser');
    service.reachGoal('order', { order_price: 10, currency: 'RUB' });
    expect(ymMock).toHaveBeenCalledWith(1001, 'reachGoal', 'order', {
      order_price: 10,
      currency: 'RUB',
    });
  });

  it('для hitWithCounter использует id счётчика', () => {
    const secondary = { id: 2002, name: 'sec', default: false, prodOnly: false as const };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: YM_CONFIG_TOKEN, useValue: [defaultConfig, secondary] },
        { provide: YM_DEFAULT_CONFIG_TOKEN, useValue: defaultConfig },
        { provide: PLATFORM_ID, useValue: 'browser' },
        YMService,
      ],
    });
    const service = TestBed.inject(YMService);
    service.hitWithCounter(2002, '/s');
    expect(ymMock).toHaveBeenCalledWith(2002, 'hit', '/s');
  });

  it('без window.ym не падает', () => {
    delete (globalThis as unknown as { ym?: unknown }).ym;
    const service = makeModule('browser');
    expect(() => service.execute(YMMethod.ReachGoal, 'x')).not.toThrow();
  });

  it('executeWithCounter с именем вызывает ym по id', () => {
    const secondary = { id: 3003, name: 'named', default: false, prodOnly: false as const };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: YM_CONFIG_TOKEN, useValue: [defaultConfig, secondary] },
        { provide: YM_DEFAULT_CONFIG_TOKEN, useValue: defaultConfig },
        { provide: PLATFORM_ID, useValue: 'browser' },
        YMService,
      ],
    });
    const service = TestBed.inject(YMService);
    service.executeWithCounter('named', 'params', { k: 1 });
    expect(ymMock).toHaveBeenCalledWith(3003, 'params', { k: 1 });
  });
});
