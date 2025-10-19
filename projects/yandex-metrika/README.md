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

---

## Обновления в версии 1.3.0:

- **Типобезопасные методы**: `execute` и `executeWithCounter` с полной проверкой типов для API Яндекс.Метрики
- **Метод `ym` устаревает**: будет удален в версии 2.0.0
- **Enum YMMethod** - все основные методы API с автодополнением
- **Предупреждения** при опечатках в названиях методов

```typescript
// Новая типобезопасность
this.metrika.execute(YMMethod.Hit, '/page');
this.metrika.execute('reachGoal', 'purchase');

// Миграция с ym()
this.metrika.execute('hit', '/page'); // или this.metrika.execute(YMMethod.Hit, '/page') вместо ym('hit', '/page')
this.metrika.executeWithCounter(123123123, YMMethod.Hit, '/page'); // вместо ym(123123123, 'hit', '/page')
```

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
  }
}
```

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
