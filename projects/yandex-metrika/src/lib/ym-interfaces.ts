export interface YMConfig {
  id: number | string; // ID счетчика Яндекс.Метрики
  init?: {
    prodOnly?: boolean; // Работать только в production режиме
    defer?: boolean; // Отложенная загрузка скрипта
  };
  tracking?: {
    clickmap?: boolean; // Карта кликов (heatmap)
    trackLinks?: boolean; // Отслеживание переходов по ссылкам
    accurateTrackBounce?: boolean; // Точный расчет показателя отказов
    trackHash?: boolean; // Отслеживание hash-навигации (для SPA)
  };
  features?: {
    webvisor?: boolean; // Запись сессий (Webvisor)
    ecommerce?: boolean | string; // Поддержка электронной коммерции
    triggerEvent?: boolean; //Отправка события после инициализации
  };
}

// export interface YMHitOptions {
//   callback?: () => void;
//   ctx?: any;
//   params?: any;
//   referer?: string;
//   title?: string;
// }
//
// export interface YMGoalOptions {
//   callback?: () => void;
//   ctx?: any;
//   params?: any;
// }
//
// export interface YMUserParams {
//   UserID?: number;
// }
//
// export interface YMEcommerceItem {
//   id: string;
//   name: string;
//   category?: string;
//   brand?: string;
//   variant?: string;
//   price?: number;
//   quantity?: number;
//   coupon?: string;
//   position?: number;
// }
//
// export interface YMEcommerceAction {
//   id: string;
//   revenue?: number;
//   coupon?: string;
// }
//
// export interface YMParams {
//   order_price?: number;
//   currency?: string;
//   [key: string]: any;
// }
