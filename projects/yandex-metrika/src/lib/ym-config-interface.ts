/**
 * Интерфейс конфигурации для счетчика Яндекс.Метрики.
 * Предоставляет гибкие настройки для одного или нескольких счетчиков с учетом окружения.
 *
 * @example
 * // Базовая конфигурация
 * {
 *   id: 104120889,
 *   name: 'main',
 *   prodOnly: true,
 *   loading: 'async',
 *   options: {
 *     webvisor: true,
 *     clickmap: true
 *   }
 * }
 *
 * @property id - Уникальный идентификатор счетчика из Яндекс.Метрики (обязательный)
 * @property name - Человекочитаемое имя счетчика для идентификации. Полезно при работе с несколькими счетчиками.
 * @property prodOnly - Если true, счетчик будет инициализирован только в production-окружении. По умолчанию: false
 * @property loading - Стратегия загрузки скрипта: 'async' (неблокирующая), 'defer' (после загрузки DOM), или 'sync' (блокирующая). По умолчанию: 'async'
 * @property alternativeScriptUrl - Кастомный URL для загрузки скрипта Яндекс.Метрики. Полезно для кастомных CDN или оптимизаций.
 * @property default - Помечает счетчик как используемый по умолчанию. Если настроено несколько счетчиков, первый default будет использоваться когда счетчик не указан явно.
 * @property options - Настройки функций отслеживания Яндекс.Метрики
 * @property options.clickmap - Включить карту кликов (heatmap). По умолчанию: false
 * @property options.trackLinks - Включить отслеживание внешних ссылок. По умолчанию: false
 * @property options.accurateTrackBounce - Включить точный расчет показателя отказов. По умолчанию: false
 * @property options.trackHash - Включить отслеживание изменений хэша URL. По умолчанию: false
 * @property options.webvisor - Включить вебвизор и запись сессий. По умолчанию: false
 * @property options.ecommerce - Включить e-commerce трекинг. Может быть boolean или custom dataLayer name. По умолчанию: false
 * @property options.triggerEvent - Включить поддержку пользовательских событий. По умолчанию: false
 *
 * @see provideYandexMetrika - Функция для предоставления конфигурации
 */
export interface YMConfig {
  id: number;
  name?: string;
  prodOnly?: boolean;
  loading?: 'async' | 'defer' | 'sync';
  alternativeScriptUrl?: string;
  default?: boolean;
  options?: {
    clickmap?: boolean;
    trackLinks?: boolean;
    accurateTrackBounce?: boolean;
    trackHash?: boolean;
    webvisor?: boolean;
    ecommerce?: boolean | string;
    triggerEvent?: boolean;
  };
}
