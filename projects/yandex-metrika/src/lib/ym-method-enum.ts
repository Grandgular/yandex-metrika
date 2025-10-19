/**
 * Enum всех доступных методов API Яндекс.Метрики
 *
 * @remarks
 * Используется для типобезопасного вызова методов через универсальный интерфейс
 *
 * @see https://yandex.ru/support/metrica/ru/objects/method-reference - Документация API
 */
export enum YMMethod {
  /**
   * Добавить поддержку расширения файла
   * @see https://yandex.ru/support/metrica/ru/objects/addfileextension
   */
  AddFileExtension = 'addFileExtension',

  /**
   * Отправка информации о переходе по внешней ссылке
   * @see https://yandex.ru/support/metrica/ru/objects/extlink
   */
  ExtLink = 'extLink',

  /**
   * Отправка информации о загрузке файла
   * @see https://yandex.ru/support/metrica/ru/objects/file
   */
  File = 'file',

  /**
   * Отправка контактной информации посетителей сайта
   * @see https://yandex.ru/support/metrica/ru/objects/first-party-params
   */
  FirstPartyParams = 'firstPartyParams',

  /**
   * Отправка контактной информации посетителей сайта с возможностью самостоятельного хеширования данных
   * @see https://yandex.ru/support/metrica/ru/objects/first-party-params-hash
   */
  FirstPartyParamsHashed = 'firstPartyParamsHashed',

  /**
   * Получение идентификатора посетителя, заданного Метрикой
   * @see https://yandex.ru/support/metrica/ru/objects/get-client-id
   */
  GetClientID = 'getClientID',

  /**
   * Отправка вручную данных о просмотрах для AJAX- и Flash-сайтов
   * @see https://yandex.ru/support/metrica/ru/objects/hit
   */
  Hit = 'hit',

  /**
   * Передача информации о том, что визит пользователя не является отказом
   * @see https://yandex.ru/support/metrica/ru/objects/notbounce
   */
  NotBounce = 'notBounce',

  /**
   * Дополнительный способ передачи пользовательских параметров в отчет Параметры визитов
   * @see https://yandex.ru/support/metrica/ru/objects/params-method
   */
  Params = 'params',

  /**
   * Достижение цели
   * @see https://yandex.ru/support/metrica/ru/objects/reachgoal
   */
  ReachGoal = 'reachGoal',

  /**
   * Передача идентификатора посетителя, заданного владельцем сайта
   * @see https://yandex.ru/support/metrica/ru/objects/set-user-id
   */
  SetUserID = 'setUserID',

  /**
   * Способ передачи пользовательских параметров в отчет Параметры посетителей
   * @see https://yandex.ru/support/metrica/ru/objects/user-params
   */
  UserParams = 'userParams',
}
