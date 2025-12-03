// Polyfill localStorage for Node.js to fix VS Code terminal issue
export async function register() {
  if (typeof globalThis.localStorage === 'undefined') {
    const storage: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
      key: (index: number) => Object.keys(storage)[index] ?? null,
      get length() { return Object.keys(storage).length; },
    };
  }
}
