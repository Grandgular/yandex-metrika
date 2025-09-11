declare global {
  interface Window {
    ym: (
      id: number,
      method: 'init' | 'reachGoal' | 'params' | 'userParams' | 'hit',
      eventOrParams?: string | Record<string, any>,
      options?: Record<string, any>,
      callback?: () => void,
    ) => void;
  }
}

export {};
