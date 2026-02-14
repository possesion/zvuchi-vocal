// Global type definitions

// Yandex.Metrica
declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      ...params: unknown[]
    ) => void;
    ymInitialized?: boolean;
    ymQueue?: Array<() => void>;
    dataLayer?: unknown[];
  }
}

export {};