import { Product, Sale } from './types';

// Simple IndexedDB wrapper for "Real" local database persistence
const DB_NAME = 'FashionPOS_DB';
const DB_VERSION = 1;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getDBProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => resolve([]); 
    };
  });
};

export const saveDBProduct = (product: Product): Promise<void> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      store.put(product);
      transaction.oncomplete = () => resolve();
    };
  });
};

export const deleteDBProduct = (id: string): Promise<void> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      store.delete(id);
      transaction.oncomplete = () => resolve();
    };
  });
};

export const saveDBSale = (sale: Sale): Promise<void> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['sales'], 'readwrite');
      const store = transaction.objectStore('sales');
      store.put(sale);
      transaction.oncomplete = () => resolve();
    };
  });
};

export const getDBSales = (): Promise<Sale[]> => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['sales'], 'readonly');
      const store = transaction.objectStore('sales');
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    };
  });
};

// Legacy LocalStorage fallback for initial data
const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  SALES: 'pos_sales',
};

export const getStoredProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredSales = (): Sale[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  return data ? JSON.parse(data) : [];
};

export const saveSale = (sale: Sale) => {
  const sales = getStoredSales();
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([...sales, sale]));
};
