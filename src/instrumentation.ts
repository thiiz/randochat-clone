export async function register() {
  if (typeof window === 'undefined') {
    // Polyfill localStorage for Node.js environment (SSR)
    const storageMap = new Map<string, string>();

    global.localStorage = {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storageMap.set(key, value);
      },
      removeItem: (key: string) => {
        storageMap.delete(key);
      },
      clear: () => {
        storageMap.clear();
      },
      get length() {
        return storageMap.size;
      },
      key: (index: number) => {
        const keys = Array.from(storageMap.keys());
        return keys[index] ?? null;
      }
    } as Storage;
  }
}

export const onRequestError = () => {};
