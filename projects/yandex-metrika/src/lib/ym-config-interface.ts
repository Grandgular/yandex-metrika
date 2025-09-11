/**
 * Configuration type for Yandex Metrika provider.
 * All properties are optional except for the required `id` field.
 *
 * @example
 * provideYandexMetrika({
 *   id: 104120889,
 *   prodOnly: true,
 *   loading: 'async'
 *   options: {
 *     webvisor: true,
 *     ecommerce: 'dataLayer',
 *     clickmap: true,
 *     // other options can be omitted
 *   },
 * });
 *
 * @property id - Counter ID (required)
 * @property prodOnly - Whether to initialize only in production (optional)
 * @property loading - Script loading strategy: 'async' | 'defer' | 'sync' (optional)
 * @property options - Tracking and feature options (all optional)
 *
 * @see provideYandexMetrika - Main usage context for this type
 */
export interface YMConfig {
  id: number;
  prodOnly?: boolean;
  loading?: 'async' | 'defer' | 'sync';
  options?: {
    clickmap?: boolean;
    trackLinks?: boolean;
    accurateTrackBounce?: boolean;
    trackHash?: boolean;
    webvisor?: boolean;
    ecommerce?: boolean | string;
    triggerEvent?: boolean;
    // ssr: boolean; todo. check
  };
}
