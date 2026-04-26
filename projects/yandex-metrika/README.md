<img src="https://raw.githubusercontent.com/Grandgular/rx/refs/heads/main/projects/showcase/public/favicon.svg" width="220px" alt="Grandgular Logo">

# @grandgular/yandex-metrika

[![npm version](https://badge.fury.io/js/@grandgular%2Fyandex-metrika.svg)](https://badge.fury.io/js/@grandgular%2Fyandex-metrika)
[![Лицензия: MIT](https://img.shields.io/badge/Лицензия-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Telegram](https://img.shields.io/badge/Канал_Grandgular-2CA5E0?style=flat&logo=telegram)](https://t.me/grandgular)
[![LinkedIn](https://img.shields.io/badge/Андрей_Шпилевский-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/andrei-shpileuski)

### Angular сервис для простой интеграции Яндекс.Метрики с поддержкой SSR, TypeScript типами и гибкой конфигурацией.

## Возможности

✅ Совместимость с Angular v19.0.0+  
✅ Поддержка SSR (без инициализации на серверной стороне)  
✅ Полная TypeScript типобезопасность  
✅ Гибкая конфигурация с опциональными свойствами  
✅ Несколько стратегий загрузки скрипта (async, defer, sync)  
✅ Поддержка нескольких счетчиков  
✅ Окружение-зависимая инициализация (режим prodOnly)  
✅ NoScript фолбэк для пользователей с отключенным JavaScript  
✅ Простой паттерн провайдеров  
✅ **Отложенная инициализация до согласия (GDPR / 152-ФЗ)**  
✅ **Автоматические virtual pageview при смене маршрута (SPA)** — `provideYandexMetrikaRouter()`

---

## Обновления в версии 1.7.0

**`provideYandexMetrikaRouter()`** — подписка на `Router.events` (`NavigationEnd`) и вызов `hit()` с `urlAfterRedirects` (и при необходимости заголовком страницы). Добавьте **после** `provideYandexMetrika` и `provideRouter`.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideYandexMetrika, provideYandexMetrikaRouter } from '@grandgular/yandex-metrika';

const routes: Routes = [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideYandexMetrika({ id: 123456, options: { trackHash: true } }),
    provideYandexMetrikaRouter({
      ignoreInitialNavigation: true, // не дублировать первый просмотр (по умолчанию)
      includePageTitle: true,        // передавать title в hit (по умолчанию)
    }),
  ],
};
```

- Совместим с `initialization: 'deferred'`: до `initializeAll()` вызовы `hit` из трекера отработают как no-op.
- **Peer-зависимости** для этой фичи: `@angular/router`, `@angular/platform-browser` (уже в peer-диапазоне пакета).

---

## Обновления в версии 1.6.0:

**Отложенная инициализация до согласия пользователя** — поддержка GDPR, 152-ФЗ и cookie banners:

```typescript
provideYandexMetrika(
  { id: 104120889, includeNoscriptFallback: false },
  { initialization: 'deferred' }
);

// После согласия:
inject(YMInitService).initializeAll();
```

- `initialization: 'deferred'` — счётчик не загружается при старте приложения
- `includeNoscriptFallback: false` — не вставлять NoScript-пиксель до согласия
- Идемпотентность: повторные вызовы `initializeAll()` безопасны
- Подробнее в разделе [Согласие на cookies](#согласие-на-cookies-gdpr--152-фз)

---

## Обновления в версии 1.5.0:

```typescript
this.metrika
  .hit('/page')
  .reachGoal('purchase', { order_price: 1000 })
  .setUserID('user-123');
```

**Специализированные методы API** - добавлены типобезопасные методы для всех вызовов Яндекс.Метрики:
- addFileExtension() - добавление расширений файлов 
- extLink() - отслеживание внешних ссылок
- file() - загрузка файлов
- firstPartyParams() - контактные данные
- getClientID() - получение ClientID
- hit() - просмотры страниц
- notBounce() - отмена отказов
- params() - параметры визитов
- reachGoal() - цели
- setUserID() - пользовательский ID
- userParams() - параметры пользователей

+ Для каждого метода есть дубликат с выбором счетчика, например:

```typescript
// Используется счетчик по умолчанию
this.metrika.hit('/page');

// С выбором счетчика
this.metrika.hitWithCounter(123123123, '/page');
```

### Как итог:
- Полная типобезопасность с автодополнением
- Проверка аргументов на этапе компиляции
- Улучшенная читаемость кода
- Снижение вероятности ошибок в названиях методов
- Единообразный API для всех методов Яндекс.Метрики
- Поддержка chaining для всех специализированных методов

---

## Установка

```bash
npm install @grandgular/yandex-metrika
```

---

## Быстрый старт

### Импорт в конфигурации приложения:

```typescript
// app.config.ts
import { provideYandexMetrika } from '@grandgular/yandex-metrika';

export const appConfig: ApplicationConfig = {
  providers: [
    // Вариант с одним счетчиком
    provideYandexMetrika({
      id: 104120889, // Обязательный: ID вашего счетчика
      prodOnly: true, // Опционально: инициализировать только в продакшене
      loading: 'async', // Опционально: стратегия загрузки
      name: 'main', // Опционально: Имя счетчика для идентификации
      options: {
        webvisor: true, // Включить вебвизор
        ecommerce: 'dataLayer', // E-commerce трекинг
        clickmap: true, // Карта кликов
        // и т.д.
      },
    }),

    // Вариант с несколькими счетчиками
    provideYandexMetrika([
      {
        id: 104120888,
        default: true, // Будет использоваться по дефолту при вызове метода execute
        name: 'main',
      },
      {
        id: 104120889, // Не по дефолту. Использовать executeWithCounter(104120889, ...) или executeWithCounter('secondary', ...)
        name: 'secondary',
      },
    ]),
  ],
};
```

### Использование в компонентах:

```typescript
import { YMService, YMMethod } from '@grandgular/yandex-metrika';

@Component({
  // ...
})
export class MyComponent {
  metrica = inject(YMService);

  someMethod() {
    // С использованием enum (максимальная типобезопасность)
    this.metrica.execute(YMMethod.ReachGoal, 'conversion');

    // Или со строковыми литералами (удобно)
    this.metrica.execute('reachGoal', 'conversion');

    // С выбором счетчика по полю name
    this.metrica.executeWithCounter('main', YMMethod.ReachGoal, 'conversion');

    // С выбором счетчика по id
    this.metrica.executeWithCounter(104120889, YMMethod.ExtLink, 'https://external.com');

    // Вызом несуществующего метода метрики
    this.metrica.execute('todoo');
    // В консоли: Вызывается неизвестный метод "todoo". Возможна опечатка
    
    // Method chaining
    this.metrika.executeWithCounter(123123123, YMMethod.Hit, '/page')
                .execute('hit', '/page')
                .execute('reachGoal', 'purchase');
  }
}
```

---

## Согласие на cookies (GDPR / 152-ФЗ)

Настройка кода не заменяет юридическое оформление политики и баннера согласия: библиотека лишь позволяет **не загружать** счётчик и скрипт Метрики до вашего явного запуска.

### Отложенная инициализация

Передайте второй аргумент с `initialization: 'deferred'`. Счётчики **не** инициализируются при старте приложения; после получения согласия вызовите `initializeAll()` у `YMInitService` (идемпотентно: повторные вызовы для того же счётчика безопасны).

```typescript
// app.config.ts
import { provideYandexMetrika, YMInitService } from '@grandgular/yandex-metrika';

export const appConfig: ApplicationConfig = {
  providers: [
    provideYandexMetrika(
      {
        id: 104120889,
        includeNoscriptFallback: false, // Не вставлять NoScript-пиксель до согласия
      },
      { initialization: 'deferred' },
    ),
  ],
};
```

```typescript
// После «Принять» в баннере cookies
import { inject } from '@angular/core';
import { YMInitService } from '@grandgular/yandex-metrika';

export class CookieBannerComponent {
  private readonly metrikaInit = inject(YMInitService);

  onAcceptAnalytics(): void {
    this.metrikaInit.initializeAll();
  }
}
```

Пока `initializeAll()` не вызван, `YMService` не отправляет события (нет инициализированного счётчика в браузере).

### Параметры провайдера (второй аргумент)

| Свойство           | Обязательность | Тип                           | По умолчанию  | Описание |
| ------------------ | -------------- | ----------------------------- | ------------- | -------- |
| `initialization`   | Опциональный   | `'immediate' \| 'deferred'`   | `'immediate'` | `immediate` — загрузка при старте; `deferred` — только после `YMInitService.initializeAll()` |

---

## Опции конфигурации

| Свойство                      | Обязательность | Тип                            | По умолчанию | Описание                                                    |
| ----------------------------- | -------------- | ------------------------------ | ------------ | ----------------------------------------------------------- |
| `id`                          | `Обязательный` | `number`                       | -            | ID вашего счетчика Яндекс.Метрики                           |
| `name`                        | `Опциональный` | `string`                       | -            | Имя счетчика для идентификации                              |
| `prodOnly`                    | `Опциональный` | `boolean`                      | `false`      | Инициализировать только в продакшене                        |
| `loading`                     | `Опциональный` | `'async' \| 'defer' \| 'sync'` | `'async'`    | Стратегия загрузки скрипта                                  |
| `alternativeScriptUrl`        | `Опциональный` | `string`                       | -            | Альтернативный URL для загрузки скрипта                     |
| `default`                     | `Опциональный` | `boolean`                      | `false`      | Использовать как счетчик по умолчанию                       |
| `includeNoscriptFallback`     | `Опциональный` | `boolean`                      | `true`       | Вставлять NoScript с пикселем `mc.yandex.ru/watch/{id}` при инициализации |
| `options.clickmap`            | `Опциональный` | `boolean`                      | `true`       | Включить карту кликов (heatmap)                             |
| `options.trackLinks`          | `Опциональный` | `boolean`                      | `true`       | Включить отслеживание переходов по внешним ссылкам          |
| `options.accurateTrackBounce` | `Опциональный` | `boolean`                      | `true`       | Точный расчет показателя отказов                            |
| `options.trackHash`           | `Опциональный` | `boolean`                      | `false`      | Включить отслеживание изменений хэша в адресной строке      |
| `options.webvisor`            | `Опциональный` | `boolean`                      | `false`      | Включить вебвизор и запись сессий                           |
| `options.ecommerce`           | `Опциональный` | `boolean \| string \| any[]`   | `false`      | Включить e-commerce трекинг                                 |
| `options.triggerEvent`        | `Опциональный` | `boolean`                      | `false`      | Включить проверку готовности счетчика                       |
| `options.ssr`                 | `Опциональный` | `boolean`                      | `true`       | Технический параметр для работы кода вставки (SSR)          |
| `options.sendTitle`           | `Опциональный` | `boolean`                      | `true`       | Запись заголовков страницы                                  |
| `options.type`                | `Опциональный` | `number`                       | `0`          | Тип счетчика (0 - обычный, 1 - РСЯ)                         |
| `options.trustedDomains`      | `Опциональный` | `string[]`                     | -            | Доверенные домены для записи содержимого iframe             |
| `options.params`              | `Опциональный` | `object \| any[]`              | -            | Параметры визита, передаваемые при инициализации            |
| `options.defer`               | `Опциональный` | `boolean`                      | `false`      | Отключить автоматическую отправку данных при инициализации  |
| `options.childIframe`         | `Опциональный` | `boolean`                      | `false`      | Запись содержимого iframe без счетчика в дочернем окне      |
| `options.userParams`          | `Опциональный` | `object`                       | -            | Параметры посетителей сайта, передаваемые при инициализации |

---

## Сообщество и поддержка

[![Telegram](https://img.shields.io/badge/Grandgular_Channel-2CA5E0?style=flat&logo=telegram)](https://t.me/grandgular)
[![LinkedIn](https://img.shields.io/badge/Andrei_Shpileuski-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/andrei-shpileuski)
