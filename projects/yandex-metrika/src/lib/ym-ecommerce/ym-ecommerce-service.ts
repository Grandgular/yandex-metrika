import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { libName } from '../ym-lib-name';
import {
  EcommerceActionField,
  EcommerceActionType,
  EcommerceData,
  EcommerceProduct,
  EcommercePromotion,
} from './ym-ecommerce-interface';

/**
 * Сервис для работы с электронной коммерцией Яндекс.Метрики
 *
 * Предоставляет типобезопасный API для отправки данных о взаимодействиях
 * пользователей с товарами в соответствии с официальной документацией Яндекс.Метрики.
 *
 * @remarks
 * - Данные отправляются через глобальный массив dataLayer (или кастомное имя)
 * - Полное соответствие формату Google Analytics Enhanced Ecommerce
 * - Автоматическая проверка размера данных (ограничение 8192 символа)
 * - SSR-совместимость
 *
 * @example
 * // Отслеживание добавления товара в корзину
 * this.ecommerce.add({
 *   id: 'product-123',
 *   name: 'Футболка',
 *   price: 1000,
 *   quantity: 1
 * });
 *
 * @see https://yandex.ru/support/metrica/ru/ecommerce/data
 */
@Injectable({ providedIn: 'root' })
export class YMEcommerceService {
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly #maxDataLength = 8192;

  readonly defaultDataLayerName = 'dataLayer';
  readonly defaultDataLayer = signal<string | null>(null);
  readonly initializedDataLayers = signal<string[]>([]);

  /**
   * Базовый метод для отправки данных электронной коммерции
   *
   * Формирует и отправляет данные в точном соответствии с форматом Яндекс.Метрики.
   * Автоматически обрабатывает различные структуры данных для разных типов действий.
   *
   * @param actionType - Тип действия пользователя с товаром
   * @param products - Список товаров (не используется для impressions, promoView, promoClick)
   * @param actionField - Данные о действии (только для purchase)
   * @param promotions - Данные о промо-кампаниях (только для promoView/promoClick)
   * @param currencyCode - Код валюты (ISO 4217), по умолчанию 'RUB'
   *
   * @throws {Error} При превышении размера данных 8192 символа
   *
   * @example
   * // Отправка данных о покупке
   * this.pushEcommerceData(
   *   'purchase',
   *   products,
   *   { id: 'order-123', revenue: 5000 },
   *   [],
   *   'RUB'
   * );
   */
  public execute(
    actionType: EcommerceActionType,
    products: EcommerceProduct[] = [],
    actionField?: EcommerceActionField,
    promotions: EcommercePromotion[] = [],
    currencyCode: string = 'RUB',
  ): void {
    if (!this.defaultDataLayer()) {
      console.warn(
        `${libName}: В провайдере счетчика по умолчанию не определено свойство ecommerce.`,
      );
      return;
    }

    this.executeWithDataLayer(
      this.defaultDataLayer()!,
      actionType,
      products,
      actionField,
      promotions,
      currencyCode,
    );
  }

  /**
   * Отправка данных электронной коммерции в указанный dataLayer
   *
   * @param dataLayer - Имя dataLayer для отправки данных
   * @param actionType - Тип действия пользователя с товаром
   * @param products - Список товаров (не используется для impressions, promoView, promoClick)
   * @param actionField - Данные о действии (только для purchase)
   * @param promotions - Данные о промо-кампаниях (только для promoView/promoClick)
   * @param currencyCode - Код валюты (ISO 4217), по умолчанию 'RUB'
   *
   * @throws {Error} При превышении размера данных 8192 символа или недоступности dataLayer
   */
  public executeWithDataLayer(
    dataLayer: string,
    actionType: EcommerceActionType,
    products: EcommerceProduct[] = [],
    actionField?: EcommerceActionField,
    promotions: EcommercePromotion[] = [],
    currencyCode: string = 'RUB',
  ): void {
    if (!this.#isBrowser) return;

    this.validateDataLayerAvailability(dataLayer);

    try {
      const pushData = this.buildEcommerceData(
        actionType,
        products,
        actionField,
        promotions,
        currencyCode,
      );

      this.validateDataSize(pushData);
      this.pushToDataLayer(dataLayer, pushData);
    } catch (error) {
      console.error(`${libName}: Ошибка отправки Ecommerce данных:`, error);
      throw error;
    }
  }

  /**
   * Отслеживание просмотра списка товаров
   *
   * Используется когда пользователь видит список товаров (каталог, поисковая выдача).
   * Данные должны отправляться в момент открытия списка товаров.
   *
   * @param products - Массив товаров в списке с позициями
   * @param currencyCode - Код валюты (ISO 4217)
   *
   * @example
   * this.impressions([
   *   { id: 'P15432', name: 'Футболка', price: 477.60, position: 1 },
   *   { id: 'P15435', name: 'Футболка', price: 500.60, position: 2 }
   * ]);
   */
  public impressions(products: EcommerceProduct[], currencyCode: string = 'RUB'): void {
    this.execute('impressions', products, undefined, [], currencyCode);
  }

  /**
   * Отслеживание просмотра списка товаров в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param products - Массив товаров в списке с позициями
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public impressionsWithDataLayer(
    dataLayerName: string,
    products: EcommerceProduct[],
    currencyCode: string = 'RUB',
  ): void {
    this.executeWithDataLayer(dataLayerName, 'impressions', products, undefined, [], currencyCode);
  }

  /**
   * Отслеживание клика по товару из списка
   *
   * Вызывается когда пользователь кликает на товар для перехода к детальной странице.
   * Данные должны передаваться в момент клика по ссылке товара.
   *
   * @param product - Данные товара по которому произведен клик
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public click(product: EcommerceProduct, currencyCode: string = 'RUB'): void {
    this.execute('click', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание клика по товару из списка в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param product - Данные товара по которому произведен клик
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public clickWithDataLayer(
    dataLayerName: string,
    product: EcommerceProduct,
    currencyCode: string = 'RUB',
  ): void {
    this.executeWithDataLayer(dataLayerName, 'click', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание просмотра карточки товара
   *
   * Вызывается при открытии страницы с детальной информацией о товаре.
   * Данные должны отправляться в момент открытия страницы с карточкой товара.
   *
   * @param product - Данные просматриваемого товара
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public detail(product: EcommerceProduct, currencyCode: string = 'RUB'): void {
    this.execute('detail', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание просмотра карточки товара в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param product - Данные просматриваемого товара
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public detailWithDataLayer(
    dataLayerName: string,
    product: EcommerceProduct,
    currencyCode: string = 'RUB',
  ): void {
    this.executeWithDataLayer(dataLayerName, 'detail', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание добавления товара в корзину
   *
   * Вызывается при добавлении товара в корзину покупок.
   * Данные должны отправляться в момент добавления заказа в корзину.
   *
   * @param product - Данные добавляемого товара
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public add(product: EcommerceProduct, currencyCode: string = 'RUB'): void {
    this.execute('add', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание добавления товара в корзину в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param product - Данные добавляемого товара
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public addWithDataLayer(
    dataLayerName: string,
    product: EcommerceProduct,
    currencyCode: string = 'RUB',
  ): void {
    this.executeWithDataLayer(dataLayerName, 'add', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание удаления товара из корзины
   *
   * Вызывается при удалении товара из корзины покупок.
   * Данные должны отправляться в момент удаления заказа из корзины.
   *
   * @param product - Данные удаляемого товара
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public remove(product: EcommerceProduct, currencyCode: string = 'RUB'): void {
    this.execute('remove', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание удаления товара из корзины в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param product - Данные удаляемого товара
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public removeWithDataLayer(
    dataLayerName: string,
    product: EcommerceProduct,
    currencyCode: string = 'RUB',
  ): void {
    this.executeWithDataLayer(dataLayerName, 'remove', [product], undefined, [], currencyCode);
  }

  /**
   * Отслеживание совершения покупки
   *
   * Вызывается при завершении заказа/покупки.
   * Данные должны отправляться в момент подтверждения заказа.
   *
   * @param actionField - Данные о заказе (обязателен ID заказа)
   * @param products - Список товаров в заказе
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public purchase(
    actionField: EcommerceActionField,
    products: EcommerceProduct[],
    currencyCode: string = 'RUB',
  ): void {
    this.execute('purchase', products, actionField, [], currencyCode);
  }

  /**
   * Отслеживание совершения покупки в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param actionField - Данные о заказе (обязателен ID заказа)
   * @param products - Список товаров в заказе
   * @param currencyCode - Код валюты (ISO 4217)
   */
  public purchaseWithDataLayer(
    dataLayerName: string,
    actionField: EcommerceActionField,
    products: EcommerceProduct[],
    currencyCode: string = 'RUB',
  ): void {
    this.executeWithDataLayer(dataLayerName, 'purchase', products, actionField, [], currencyCode);
  }

  /**
   * Отслеживание просмотра внутренней рекламы
   *
   * Вызывается когда пользователь увидел промо-материалы на сайте.
   * Данные должны отправляться при просмотре рекламных материалов.
   *
   * @param promotions - Данные о просмотренных промо-кампаниях
   */
  public promoView(promotions: EcommercePromotion[]): void {
    this.execute('promoView', [], undefined, promotions);
  }

  /**
   * Отслеживание просмотра внутренней рекламы в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param promotions - Данные о просмотренных промо-кампаниях
   */
  public promoViewWithDataLayer(dataLayerName: string, promotions: EcommercePromotion[]): void {
    this.executeWithDataLayer(dataLayerName, 'promoView', [], undefined, promotions);
  }

  /**
   * Отслеживание клика по внутренней рекламе
   *
   * Вызывается при клике на промо-материалы на сайте.
   * Данные должны отправляться при клике по рекламному материалу.
   *
   * @param promotion - Данные о промо-кампании по которой произведен клик
   */
  public promoClick(promotion: EcommercePromotion): void {
    this.execute('promoClick', [], undefined, [promotion]);
  }

  /**
   * Отслеживание клика по внутренней рекламе в указанный dataLayer
   *
   * @param dataLayerName - Имя dataLayer для отправки данных
   * @param promotion - Данные о промо-кампании по которой произведен клик
   */
  public promoClickWithDataLayer(dataLayerName: string, promotion: EcommercePromotion): void {
    this.executeWithDataLayer(dataLayerName, 'promoClick', [], undefined, [promotion]);
  }

  /**
   * Проверяет размер данных согласно ограничению Яндекс.Метрики (8192 символа)
   *
   * @param data - Данные для проверки
   * @throws {Error} Если размер данных превышает 8192 символа
   */
  private validateDataSize(data: any): void {
    const dataString = JSON.stringify(data);

    if (dataString.length > this.#maxDataLength) {
      const errorMessage = `${libName}: Размер Ecommerce данных (${dataString.length} символов) превышает максимально допустимый размер 8192 символа. Рекомендуется разбить данные на части.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Создает объект данных для электронной коммерции
   */
  private buildEcommerceData(
    actionType: EcommerceActionType,
    products: EcommerceProduct[],
    actionField?: EcommerceActionField,
    promotions: EcommercePromotion[] = [],
    currencyCode: string = 'RUB',
  ): { ecommerce: EcommerceData } {
    const ecommerceData: EcommerceData = { currencyCode };

    switch (actionType) {
      case 'impressions':
        ecommerceData['impressions'] = products;
        break;

      case 'promoView':
      case 'promoClick':
        ecommerceData[actionType] = { promotions };
        break;

      default:
        const actionData: any = {};

        if (actionType === 'purchase' && actionField) {
          actionData.actionField = actionField;
        }

        if (products.length > 0) {
          actionData.products = products;
        }

        ecommerceData[actionType] = actionData;
        break;
    }

    return { ecommerce: ecommerceData };
  }

  /**
   * Отправляет данные в указанный dataLayer
   */
  private pushToDataLayer(dataLayer: string, data: any): void {
    (window as any)[dataLayer].push(data);
  }

  /**
   * Проверяет доступность dataLayer
   */
  private validateDataLayerAvailability(dataLayer: string): void {
    if (!(window as any)[dataLayer])
      throw new Error(
        `${libName}: DataLayer "${dataLayer}" не найден. Убедитесь, что он инициализирован.`,
      );

    if (!Array.isArray((window as any)[dataLayer]))
      throw new Error(`${libName}: DataLayer "${dataLayer}" должен быть массивом`);
  }
}
