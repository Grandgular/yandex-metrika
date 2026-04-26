import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { YM_CONFIG_TOKEN } from './ym-config-token';
import { YMInitService } from './ym-init-service';

describe('YMInitService', () => {
  const originalYm = (globalThis as unknown as { ym?: unknown }).ym;
  const cfg = { id: 5005, prodOnly: false, includeNoscriptFallback: false as const };

  afterEach(() => {
    if (originalYm === undefined) {
      delete (globalThis as unknown as { ym?: unknown }).ym;
    } else {
      (globalThis as unknown as { ym: unknown }).ym = originalYm;
    }
  });

  function makeInit(platformId: string) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: YM_CONFIG_TOKEN, useValue: [cfg] },
        { provide: PLATFORM_ID, useValue: platformId },
        YMInitService,
      ],
    });
    return TestBed.inject(YMInitService);
  }

  it('на сервере не вставляет скрипт', () => {
    const service = makeInit('server');
    const doc = TestBed.inject(DOCUMENT);
    const head = doc.head;
    const before = head.querySelectorAll('script').length;
    service.initialize(cfg);
    expect(head.querySelectorAll('script').length).toBe(before);
  });

  it('в браузере инициализирует очередь ym и register init', () => {
    delete (globalThis as unknown as { ym?: unknown }).ym;
    const service = makeInit('browser');
    service.initialize(cfg);
    const ym = (globalThis as unknown as { ym: (id: number, a: string, b: unknown) => void }).ym;
    expect(typeof ym).toBe('function');
  });

  it('initialize дважды с тем же id не дублирует тег script', () => {
    delete (globalThis as unknown as { ym?: unknown }).ym;
    const service = makeInit('browser');
    const doc = TestBed.inject(DOCUMENT);
    const sel = 'script[src="https://mc.yandex.ru/metrika/tag.js"]';
    const n0 = doc.querySelectorAll(sel).length;
    service.initialize(cfg);
    const n1 = doc.querySelectorAll(sel).length;
    service.initialize(cfg);
    const n2 = doc.querySelectorAll(sel).length;
    expect(n1 - n0).toBe(1);
    expect(n2).toBe(n1);
  });
});
