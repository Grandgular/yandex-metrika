import { YMConfig } from './ym-interfaces';

export const defaultYMConfig: Omit<YMConfig, 'id'> = {
  init: {
    prodOnly: false, // По умолчанию работаем во всех средах
    defer: false, // Обычная загрузка (не отложенная)
  },
  tracking: {
    clickmap: true, // Карта кликов включена (стандартно в Метрике)
    trackLinks: true, // Отслеживание ссылок включено (стандартно)
    accurateTrackBounce: true, // Точный отскок включен (стандартно)
    trackHash: false, // Hash-навигация отключена (включать для SPA)
  },
  features: {
    webvisor: false, // Вебвизор отключен (требует отдельного подключения)
    ecommerce: false, // Ecommerce отключен
    triggerEvent: false, // Триггерные события отключены
  },
};
