/**
 * Интерфейс конфигурации для счетчика Яндекс.Метрики.
 * Предоставляет гибкие настройки для одного или нескольких счетчиков с учетом окружения.
 * Официальная документация: https://yandex.ru/support/metrica/ru/code/counter-initialize
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
 */
export interface YMConfig {
  id: number;
  name?: string;
  prodOnly?: boolean;
  loading?: 'async' | 'defer' | 'sync';
  alternativeScriptUrl?: string;
  default?: boolean;
  options?: {
    /**
     * Включить карту кликов (heatmap)
     * @default true
     */
    clickmap?: boolean;

    /**
     * Включить отслеживание переходов по внешним ссылкам
     * @default true
     */
    trackLinks?: boolean;

    /**
     * Точный показатель отказов
     * - true: включить (15 секунд)
     * - false: отключить
     * - number: время в миллисекундах
     * @default true
     */
    accurateTrackBounce?: boolean | number;

    /**
     * Включить отслеживание изменений хэша в адресной строке
     * @default false
     */
    trackHash?: boolean;

    /**
     * Включить вебвизор и запись сессий
     * @default false
     */
    webvisor?: boolean;

    /**
     * Включить e-commerce трекинг
     * - true: использовать dataLayer
     * - string: кастомное имя dataLayer
     * - any[]: кастомный массив данных
     * @default false
     */
    ecommerce?: boolean | string | any[];

    /**
     * Включить проверку готовности счетчика
     * @default false
     */
    triggerEvent?: boolean;

    /**
     * Технический параметр для работы кода вставки (SSR)
     * @default true
     */
    ssr?: boolean;

    /**
     * Запись заголовков страницы
     * @default true
     */
    sendTitle?: boolean;

    /**
     * Тип счетчика (0 - обычный, 1 - РСЯ)
     * @default 0
     */
    type?: number;

    /**
     * Доверенные домены для записи содержимого iframe
     */
    trustedDomains?: string[];

    /**
     * Параметры визита, передаваемые при инициализации
     */
    params?: object | any[];

    /**
     * Отключить автоматическую отправку данных при инициализации
     * @default false
     */
    defer?: boolean;

    /**
     * Запись содержимого iframe без счетчика в дочернем окне
     * @default false
     */
    childIframe?: boolean;

    /**
     * Параметры посетителей сайта, передаваемые при инициализации
     */
    userParams?: object;
  };
}
