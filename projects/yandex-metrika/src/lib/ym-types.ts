declare global {
  interface Window {
    ym: (...args: unknown[]) => void;
  }
}

export {};
