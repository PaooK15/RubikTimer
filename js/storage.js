/**
 * storage.js
 * High-reliability client storage for Rubik's Cube Timer
 * - IndexedDB for high-capacity binary wallpaper storage (video, gif, high-res images)
 * - LocalStorage for session solves, preferences, and custom theme variables
 */

const DB_NAME = 'SpeedcubeTimerDB';
const DB_VERSION = 1;
const WALLPAPER_STORE = 'wallpapers';

class StorageManager {
  constructor() {
    this.db = null;
    this.dbReady = this.initIndexedDB();
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(WALLPAPER_STORE)) {
          db.createObjectStore(WALLPAPER_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB failed to open, falling back to local storage URL', event.target.error);
        resolve(null);
      };
    });
  }

  // Save custom wallpaper blob (image, gif, or video file)
  async saveWallpaperBlob(blob, type, name = 'custom-wallpaper') {
    await this.dbReady;
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(WALLPAPER_STORE, 'readwrite');
        const store = tx.objectStore(WALLPAPER_STORE);
        const data = {
          id: 'active_custom_wallpaper',
          blob: blob,
          mimeType: type,
          name: name,
          updatedAt: Date.now()
        };
        const request = store.put(data);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      } catch (err) {
        console.error('Failed to save wallpaper in IndexedDB', err);
        reject(err);
      }
    });
  }

  // Load custom wallpaper blob from IndexedDB
  async getWallpaperBlob() {
    await this.dbReady;
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(WALLPAPER_STORE, 'readonly');
        const store = tx.objectStore(WALLPAPER_STORE);
        const request = store.get('active_custom_wallpaper');
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  // Delete stored wallpaper blob
  async clearWallpaperBlob() {
    await this.dbReady;
    if (!this.db) return;
    try {
      const tx = this.db.transaction(WALLPAPER_STORE, 'readwrite');
      const store = tx.objectStore(WALLPAPER_STORE);
      store.delete('active_custom_wallpaper');
    } catch (e) {
      console.warn(e);
    }
  }

  // LocalStorage JSON helpers with fallback
  getJSON(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.warn(`Error reading key ${key} from localStorage`, e);
      return fallback;
    }
  }

  setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Error writing key ${key} to localStorage`, e);
      return false;
    }
  }

  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  set(key, val) {
    try {
      localStorage.setItem(key, val);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const storage = new StorageManager();
