<img src="https://raw.githubusercontent.com/Grandgular/rx/refs/heads/main/projects/showcase/public/favicon.svg" width="220px" alt="Grandgular Logo">

# @grandgular/yandex-metrika
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Telegram](https://img.shields.io/badge/Grandgular_Channel-2CA5E0?style=flat&logo=telegram)](https://t.me/grandgular)
[![LinkedIn](https://img.shields.io/badge/Andrei_Shpileuski-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/andrei-shpileuski)

### Angular service for easy Yandex Metrika integration with SSR support, TypeScript typings and flexible configuration.

## Features
✅ Angular 16+ compatible  
✅ SSR support (no initialization on server-side)  
✅ TypeScript full type safety  
✅ Flexible configuration with optional properties  
✅ Multiple loading strategies (async, defer, sync)  
✅ Environment aware (prodOnly mode)  
✅ NoScript fallback for users with disabled JavaScript  
✅ Easy to use provider pattern

---

## Installation

```
npm install @grandgular/yandex-metrika
```

---

## Quick Start

### Import in your app configuration:

```typescript
// app.config.ts
import { provideYandexMetrika } from '@grandgular/yandex-metrika';

export const appConfig: ApplicationConfig = {
  providers: [
    provideYandexMetrika({
      id: 104120889,
      prodOnly: true,
      loading: 'async',
      options: {
        webvisor: true,
        ecommerce: 'dataLayer',
        clickmap: true,
        // etc.
      },
    }),
  ],
};
```

### Use in your components:

```typescript
import { YMService } from '@grandgular/yandex-metrika';

@Component({
  // ...
})
export class MyComponent {
  metrica = inject(YMService);

  onSignUp() {
    this.metrica.ym('reachGoal', 'signup', { plan: 'premium', source: 'google' });
  }
}
```

---

## Configuration Options

| Property                      | Optional/Required | Type                           | Default   | Description                                         |
| ----------------------------- | ----------------- | ------------------------------ | --------- | --------------------------------------------------- |
| `id`                          | `Required`        | `number`                       | -         | Your Yandex Metrika counter ID                      |
| `prodOnly`                    | `Optional`        | `boolean`                      | `false`   | Initialize only in production mode                  |
| `loading`                     | `Optional`        | `'async' \| 'defer' \| 'sync'` | `'async'` | Script loading strategy                             |
| `options.clickmap`            | `Optional`        | `boolean`                      | `false`   | Enable click tracking and heatmap                   |
| `options.trackLinks`          | `Optional`        | `boolean`                      | `false`   | Enable outbound link tracking                       |
| `options.accurateTrackBounce` | `Optional`        | `boolean`                      | `false`   | Accurate bounce rate calculation                    |
| `options.trackHash`           | `Optional`        | `boolean`                      | `false`   | Track URL hash changes                              |
| `options.webvisor`            | `Optional`        | `boolean`                      | `false`   | Enable session replay and analytics                 |
| `options.ecommerce`           | `Optional`        | `boolean \| string`            | `false`   | E-commerce tracking (true or custom dataLayer name) |
| `options.triggerEvent`        | `Optional`        | `boolean`                      | `false`   | Enable custom events support                        |

---

## API Reference

### Automatic ID Handling

```typescript
// With automatic ID (uses configured ID)
ym('reachGoal', 'purchase'); // → ym(104120889, 'reachGoal', 'purchase')

// With explicit ID (overrides configured ID)
ym(999999, 'hit', '/homepage'); // → ym(999999, 'hit', '/homepage')
```

### YMService Methods

```typescript
// Universal method for all Yandex Metrika API calls
ym(...args: unknown[]): void

// Examples:
ym('hit', '/page-url'); // Track page view
ym('reachGoal', 'goal-name', params); // Track goal
ym('params', { userId: '123' }); // Set visit parameters
ym('userParams', userData); // Set user parameters
ym('ecommerce.addProduct', productData); // E-commerce tracking
```

---

## Community & Support

🔹 **Angular Community**:  
Join our Telegram channel for Angular tips and discussions:  
[![Telegram](https://img.shields.io/badge/Grandgular_Channel-2CA5E0?style=flat&logo=telegram)](https://t.me/grandgular)

🔹 **Author**:  
Connect with me on LinkedIn:  
[![LinkedIn](https://img.shields.io/badge/Andrei_Shpileuski-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/andrei-shpileuski)
