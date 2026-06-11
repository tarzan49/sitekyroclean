// sessionStorage/localStorage can throw (e.g. Safari Private Browsing, restricted
// in-app browsers). These helpers swallow that failure with a console warning so
// a storage error never blocks the calling flow.

export function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.warn(`[safeStorage] sessionStorage.getItem("${key}") failed:`, e);
    return null;
  }
}

export function safeSessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[safeStorage] sessionStorage.setItem("${key}") failed:`, e);
  }
}

export function safeLocalGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`[safeStorage] localStorage.getItem("${key}") failed:`, e);
    return null;
  }
}

export function safeLocalSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[safeStorage] localStorage.setItem("${key}") failed:`, e);
  }
}
