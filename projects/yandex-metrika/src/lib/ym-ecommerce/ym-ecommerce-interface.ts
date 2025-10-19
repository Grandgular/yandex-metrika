/**
 * Данные товара для электронной коммерции
 * @see https://yandex.ru/support/metrica/ru/data-collection/ecommerce
 */
export interface EcommerceProduct {
  /**
   * Идентификатор товара (SKU)
   * @remarks Обязательно указать id или name
   */
  id?: string;

  /**
   * Название товара
   * @remarks Обязательно указать id или name
   */
  name?: string;

  /**
   * Бренд, торговая марка
   * @example "Яндекс / Yandex"
   */
  brand?: string;

  /**
   * Категория товара
   * @remarks Поддерживается иерархия до 5 уровней через символ /
   * @example "Одежда / Мужская одежда / Футболки"
   */
  category?: string;

  /**
   * Промокод ассоциированный с товаром
   * @example "PARTNER_SITE_15"
   */
  coupon?: string;

  /**
   * Размер скидки на товар
   */
  discount?: number;

  /**
   * Список, к которому относится товар
   * @remarks Рекомендуется указывать во всех событиях после просмотра списка
   */
  list?: string;

  /**
   * Позиция товара в списке
   * @example 2
   */
  position?: number;

  /**
   * Цена единицы товара
   */
  price?: number;

  /**
   * Количество единиц товара
   */
  quantity?: number;

  /**
   * Разновидность товара
   * @example "Красный цвет"
   */
  variant?: string;
}

/**
 * Данные о действии с заказом
 * @remarks Используется только для действия 'purchase'
 */
export interface EcommerceActionField {
  /**
   * Идентификатор покупки (обязательно)
   * @example "TRX#54321"
   */
  id: string;

  /**
   * Промокод, ассоциированный со всей покупкой
   */
  coupon?: string;

  /**
   * Номер цели в Яндекс.Метрике
   * @remarks Цель должна быть типа JavaScript-событие
   */
  goal_id?: number;

  /**
   * Полученный доход
   * @remarks Если не указан, вычисляется автоматически как сумма цен товаров
   */
  revenue?: number;
}

/**
 * Данные промо-кампании для внутренней рекламы
 */
export interface EcommercePromotion {
  /**
   * Идентификатор промокампании (обязательно)
   */
  id: string;

  /**
   * Название промокампании
   */
  name?: string;

  /**
   * Название рекламного баннера
   */
  creative?: string;

  /**
   * Слот рекламного баннера
   */
  creative_slot?: string;

  /**
   * Позиция рекламного баннера
   */
  position?: string;
}

/**
 * Типы действий в электронной коммерции
 * @remarks Каждый тип соответствует определенному этапу воронки продаж
 */
export type EcommerceActionType =
  | 'impressions' // Просмотр списка товаров
  | 'click' // Клик по товару в списке
  | 'detail' // Просмотр карточки товара
  | 'add' // Добавление в корзину
  | 'remove' // Удаление из корзины
  | 'purchase' // Совершение покупки
  | 'promoView' // Просмотр внутренней рекламы
  | 'promoClick'; // Клик по внутренней рекламе

/**
 * Основной контейнер данных для электронной коммерции
 * @remarks Соответствует структуре Google Analytics Enhanced Ecommerce
 */
export interface EcommerceData {
  /**
   * Трехбуквенный код валюты по ISO 4217
   * @default "RUB"
   * @remarks При другой валюте отправляются нулевые значения
   */
  currencyCode?: string;

  /**
   * Динамические поля для разных типов действий
   */
  [key: string]: any;
}
