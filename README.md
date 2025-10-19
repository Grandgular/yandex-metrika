<img src="https://raw.githubusercontent.com/Grandgular/rx/refs/heads/main/projects/showcase/public/favicon.svg" width="220px" alt="Grandgular Logo">

# @grandgular/yandex-metrika
[![npm version](https://badge.fury.io/js/@grandgular%2Fyandex-metrika.svg)](https://badge.fury.io/js/@grandgular%2Fyandex-metrika)
[![Лицензия: MIT](https://img.shields.io/badge/Лицензия-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Telegram](https://img.shields.io/badge/Канал_Grandgular-2CA5E0?style=flat&logo=telegram)](https://t.me/grandgular)
[![LinkedIn](https://img.shields.io/badge/Андрей_Шпилевский-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/andrei-shpileuski)

### Angular сервис для простой интеграции Яндекс.Метрики с поддержкой SSR, TypeScript типами и гибкой конфигурацией.

## Обновления в версии 1.2.0:

#### Параметры инициализации счетчика приведены в соответствие с официальной документацией Яндекс.Метрики:

- **Добавлены недостающие параметры:** `ssr`, `sendTitle`, `type`, `trustedDomains`, `params`, `defer`, `childIframe`, `userParams`
- **Источник:** [Официальная документация](https://yandex.ru/support/metrica/ru/code/counter-initialize)

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
    provideYandexMetrika({
      id: 104120889, // Обязательный: ID вашего счетчика
      prodOnly: true, // Опционально: инициализировать только в продакшене
      loading: 'async', // Опционально: стратегия загрузки
      options: {
        webvisor: true, // Включить вебвизор
        ecommerce: 'dataLayer', // E-commerce трекинг
        clickmap: true, // Карта кликов
        // и т.д.
      },
    }),
  ],
};
```

### Использование в компонентах:

```typescript
import { YMService } from '@grandgular/yandex-metrika';

@Component({
  // ...
})
export class MyComponent {
  metrica = inject(YMService);

  onSignUp() {
    this.metrica.ym('reachGoal', 'регистрация', {
      план: 'премиум',
      источник: 'google',
    });
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

## Справочник API

### Автоматическое определение счетчика

```typescript
// Автоматическое использование ID (использует сконфигурированный ID)
ym('reachGoal', 'покупка'); // → ym(104120889, 'reachGoal', 'покупка')

// Явное указание ID счетчика
ym(999999, 'hit', '/главная'); // → ym(999999, 'hit', '/главная')

// Использование по имени счетчика
ym('аналитика', 'params', { userId: '123' }); // → ym(104120889, 'params', { userId: '123' })
```

### Методы YMService

```typescript
// Универсальный метод для всех вызовов API Яндекс.Метрики
ym(...args: unknown[]): void

// Примеры:
  ym('hit', '/url-страницы'); // Отслеживание просмотра страницы
ym('reachGoal', 'имя-цели', params); // Отслеживание достижения цели
ym('params', { userId: '123' }); // Установка параметров визита
ym('userParams', userData); // Установка пользовательских параметров
ym('ecommerce.addProduct', productData); // E-commerce трекинг
```

### Несколько счетчиков

```typescript
// Конфигурация нескольких счетчиков
provideYandexMetrika([
  {
    id: 104120889,
    name: 'продакшен',
    prodOnly: true,
    default: true,
    options: { webvisor: true },
  },
  {
    id: 35567075,
    name: 'тестовый',
    options: { trackLinks: true },
  },
]);
```

---

## Сообщество и поддержка

[![Telegram](https://img.shields.io/badge/Grandgular_Channel-2CA5E0?style=flat&logo=telegram)](https://t.me/grandgular)
[![LinkedIn](https://img.shields.io/badge/Andrei_Shpileuski-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/andrei-shpileuski)
