/**
 * Type definitions for smsaero-mobileid-sdk
 * Документация: https://smsaero.ru/cabinet/settings/mobile-id/integration/91
 */

declare module 'smsaero-mobileid-sdk' {
  export interface MobileIDOptions {
    /** URL клиентского backend для получения init-токена */
    tokenUrl: string;
    /** URL MobileID backend (переопределяет глобальный) */
    baseUrl?: string;
    /** Код страны для нормализации (по умолчанию 'RU') */
    country?: string;
  }

  export interface ConfigureOptions {
    baseUrl?: string;
  }

  export interface PhoneResult {
    phone?: string;
    error?: string;
  }

  export interface CountryInfo {
    code: string;
    prefix: string;
    length: number;
  }

  // События
  export interface ReadyEvent {
    session_id: string;
  }

  export interface PendingEvent {
    phone: string;
  }

  export interface VerifiedEvent {
    verify_token: string | null;
  }

  export interface RejectedEvent {
    verify_token: string | null;
  }

  export interface ExpiredEvent {
    verify_token: string | null;
  }

  export interface InvalidCodeEvent {
    message: string;
  }

  export interface ErrorEvent {
    code: string;
    message: string;
    status?: number;
  }

  // export interface RateLimitEvent {}

  export type EventMap = {
    ready: ReadyEvent;
    pending: PendingEvent;
    otp_required: Record<string, never>;
    verified: VerifiedEvent;
    rejected: RejectedEvent;
    expired: ExpiredEvent;
    invalid_code: InvalidCodeEvent;
    rate_limit: RateLimitEvent;
    error: ErrorEvent;
  };

  export type MobileIDState = 'idle' | 'ready' | 'pending' | 'otp' | 'final';

  export class MobileID {
    constructor(options: MobileIDOptions);

    /** Глобальная настройка — вызывать до создания экземпляров */
    static configure(config: ConfigureOptions): void;

    /** Список поддерживаемых стран */
    static countries(): CountryInfo[];

    /** Нормализация номера (статический метод) */
    static normalizePhone(phone: string, country: string): PhoneResult;

    /** Подписка на события */
    on<K extends keyof EventMap>(
      event: K,
      callback: (data: EventMap[K]) => void
    ): this;

    /** Отписка от событий */
    off<K extends keyof EventMap>(
      event: K,
      callback: (data: EventMap[K]) => void
    ): this;

    /** Инициализация: fingerprint → токен → сессия */
    init(): Promise<void>;

    /** Запуск верификации номера */
    start(phone: string): Promise<void>;

    /** Отправка OTP-кода */
    submitOTP(code: string): Promise<void>;

    /** Тихая перезагрузка цикла */
    silentRetry(): Promise<void>;

    /** Нормализация номера */
    normalizePhone(phone: string, country?: string): PhoneResult;

    /** Нормализованный номер */
    getPhone(): string | null;

    /** ID сессии */
    getSessionId(): string | null;

    /** Хэш отпечатка браузера */
    getFingerprintHash(): string | null;

    /** Текущее состояние: idle | ready | pending | otp | final */
    getState(): MobileIDState;

    /** Количество выполненных silentRetry с момента последнего init/start */
    getRetryCount(): number;

    /** Уничтожить экземпляр */
    destroy(): void;
  }

  export default MobileID;
}
