// Yandex.Metrica TypeScript definitions

export type YandexMetricaMethod =
  | 'init'
  | 'hit'
  | 'reachGoal'
  | 'params'
  | 'userParams'
  | 'notBounce'
  | 'addFileExtension'
  | 'extLink'
  | 'file'
  | 'getClientID'
  | 'setUserID'
  | 'firstPartyParams';

export interface YandexMetricaInitOptions {
  /** Отслеживание кликов по карте сайта */
  clickmap?: boolean;
  /** Отслеживание внешних ссылок */
  trackLinks?: boolean;
  /** Точный показатель отказов */
  accurateTrackBounce?: boolean | number;
  /** Вебвизор */
  webvisor?: boolean;
  /** Отслеживание хеша в URL */
  trackHash?: boolean;
  /** E-commerce */
  ecommerce?: string | boolean;
  /** Параметры визитов */
  params?: Record<string, unknown>;
  /** Параметры пользователей */
  userParams?: Record<string, unknown>;
  /** Доверенные домены */
  trustedDomains?: string[];
  /** Дочерние iframe */
  childIframe?: boolean;
  /** Отключение автоматической отправки хита */
  defer?: boolean;
  /** Триггер для отправки данных */
  triggerEvent?: boolean;
}

export interface YandexMetricaGoalParams {
  /** Параметры цели */
  [key: string]: unknown;
}

declare global {
  interface Window {
    ym?: {
      (counterId: number, method: 'init', options: YandexMetricaInitOptions): void;
      (counterId: number, method: 'hit', url: string, options?: { title?: string; referer?: string }): void;
      (counterId: number, method: 'reachGoal', target: string, params?: YandexMetricaGoalParams, callback?: () => void, ctx?: unknown): void;
      (counterId: number, method: 'params', params: Record<string, unknown>): void;
      (counterId: number, method: 'userParams', params: Record<string, unknown>): void;
      (counterId: number, method: 'notBounce'): void;
      (counterId: number, method: 'addFileExtension', extensions: string | string[]): void;
      (counterId: number, method: 'extLink', url: string, options?: { title?: string; params?: Record<string, unknown> }): void;
      (counterId: number, method: 'file', url: string, options?: { title?: string; params?: Record<string, unknown> }): void;
      (counterId: number, method: 'getClientID', callback: (clientID: string) => void): void;
      (counterId: number, method: 'setUserID', userID: string): void;
      (counterId: number, method: 'firstPartyParams', params: Record<string, unknown>): void;
    };
    ymInitialized?: boolean;
    ymQueue?: Array<() => void>;
  }
}

export {};