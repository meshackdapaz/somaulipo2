export const idbLibrary = {
  db: null as IDBDatabase | null,
  
  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('SomaUlipoLibrary', 1);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains('books')) {
          db.createObjectStore('books');
        }
      };
      req.onsuccess = (e: any) => {
        this.db = e.target.result;
        resolve();
      };
      req.onerror = reject;
    });
  },
  
  async saveFile(id: string, arrayBuffer: ArrayBuffer): Promise<void> {
    if(!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      store.put(arrayBuffer, id);
      tx.oncomplete = () => resolve();
      tx.onerror = reject;
    });
  },
  
  async getFile(id: string): Promise<ArrayBuffer | undefined> {
    if(!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    });
  },
  
  async deleteFile(id: string): Promise<void> {
    if(!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('books', 'readwrite');
      const store = tx.objectStore('books');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = reject;
    });
  },
  
  async hasFile(id: string): Promise<boolean> {
    if(!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('books', 'readonly');
      const store = tx.objectStore('books');
      const req = store.count(id);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = reject;
    });
  }
};
