// LocalStorage Manager - Robust data persistence with error handling and quota management
export class LocalStorageManager {
  constructor() {
    this.prefix = 'devformat_';
    this.maxSize = 5 * 1024 * 1024; // 5MB limit
    this.fallbackStorage = new Map(); // In-memory fallback when localStorage unavailable
    this.isStorageAvailable = this.checkStorageAvailability();
    
    // Initialize storage monitoring
    this.setupStorageMonitoring();
  }

  /**
   * Check if localStorage is available and functional
   * @returns {boolean} True if localStorage is available
   */
  checkStorageAvailability() {
    try {
      const testKey = this.prefix + 'test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage not available, using fallback storage:', error.message);
      return false;
    }
  }

  /**
   * Set up storage monitoring for quota management
   */
  setupStorageMonitoring() {
    // Monitor storage usage periodically
    this.storageCheckInterval = setInterval(() => {
      if (this.isStorageAvailable) {
        this.checkStorageQuota();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Save data to storage with quota management and error handling
   * @param {string} key - The key to store data under (will be prefixed)
   * @param {any} data - The data to store
   * @returns {boolean} True if save was successful
   */
  save(key, data) {
    const prefixedKey = this.prefix + key;
    
    try {
      const serializedData = this.serializeData(data);
      
      // Check if data size is reasonable
      if (serializedData.length > this.maxSize) {
        console.warn(`Data too large for key ${key}: ${serializedData.length} bytes`);
        return false;
      }

      if (this.isStorageAvailable) {
        // Try to save to localStorage
        try {
          localStorage.setItem(prefixedKey, serializedData);
          return true;
        } catch (error) {
          if (error.name === 'QuotaExceededError') {
            // Handle quota exceeded by cleaning up old data
            if (this.handleQuotaExceeded(prefixedKey, serializedData)) {
              return true;
            }
          }
          
          // Fall back to in-memory storage
          console.warn(`localStorage save failed for ${key}, using fallback:`, error.message);
          this.fallbackStorage.set(prefixedKey, serializedData);
          return true;
        }
      } else {
        // Use fallback storage
        this.fallbackStorage.set(prefixedKey, serializedData);
        return true;
      }
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Load data from storage with error handling
   * @param {string} key - The key to load data from (will be prefixed)
   * @returns {any|null} The loaded data or null if not found/error
   */
  load(key) {
    const prefixedKey = this.prefix + key;
    
    try {
      let serializedData = null;
      
      if (this.isStorageAvailable) {
        serializedData = localStorage.getItem(prefixedKey);
      }
      
      // Fall back to in-memory storage if not found in localStorage
      if (serializedData === null && this.fallbackStorage.has(prefixedKey)) {
        serializedData = this.fallbackStorage.get(prefixedKey);
      }
      
      if (serializedData === null) {
        return null;
      }
      
      return this.deserializeData(serializedData);
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear specific data from storage
   * @param {string} key - The key to clear (will be prefixed)
   * @returns {boolean} True if clear was successful
   */
  clear(key) {
    const prefixedKey = this.prefix + key;
    
    try {
      if (this.isStorageAvailable) {
        localStorage.removeItem(prefixedKey);
      }
      
      this.fallbackStorage.delete(prefixedKey);
      return true;
    } catch (error) {
      console.error(`Failed to clear data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all DevFormat data from storage
   * @returns {boolean} True if clear was successful
   */
  clearAll() {
    try {
      if (this.isStorageAvailable) {
        // Remove all keys with our prefix
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      // Clear fallback storage
      for (const key of this.fallbackStorage.keys()) {
        if (key.startsWith(this.prefix)) {
          this.fallbackStorage.delete(key);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in storage
   * @param {string} key - The key to check (will be prefixed)
   * @returns {boolean} True if key exists
   */
  exists(key) {
    const prefixedKey = this.prefix + key;
    
    if (this.isStorageAvailable && localStorage.getItem(prefixedKey) !== null) {
      return true;
    }
    
    return this.fallbackStorage.has(prefixedKey);
  }

  /**
   * Get storage usage statistics
   * @returns {object} Storage usage information
   */
  getStorageInfo() {
    const info = {
      isAvailable: this.isStorageAvailable,
      usedSpace: 0,
      totalKeys: 0,
      devFormatKeys: 0,
      fallbackKeys: this.fallbackStorage.size
    };
    
    if (this.isStorageAvailable) {
      try {
        // Calculate used space and count keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            info.usedSpace += key.length + (value ? value.length : 0);
            info.totalKeys++;
            
            if (key.startsWith(this.prefix)) {
              info.devFormatKeys++;
            }
          }
        }
      } catch (error) {
        console.warn('Could not calculate storage info:', error);
      }
    }
    
    return info;
  }

  /**
   * Handle quota exceeded error by cleaning up old data
   * @param {string} newKey - The key we're trying to save
   * @param {string} newData - The data we're trying to save
   * @returns {boolean} True if cleanup was successful and data was saved
   */
  handleQuotaExceeded(newKey, newData) {
    try {
      console.warn('Storage quota exceeded, attempting cleanup...');
      
      // Get all DevFormat keys with timestamps
      const devFormatKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix) && key !== newKey) {
          try {
            const data = localStorage.getItem(key);
            const parsed = JSON.parse(data);
            devFormatKeys.push({
              key,
              timestamp: parsed.timestamp || 0,
              size: data.length
            });
          } catch (e) {
            // If we can't parse it, it's probably old format - mark for removal
            devFormatKeys.push({
              key,
              timestamp: 0,
              size: data ? data.length : 0
            });
          }
        }
      }
      
      // Sort by timestamp (oldest first)
      devFormatKeys.sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest entries until we have enough space
      let freedSpace = 0;
      const targetSpace = newData.length * 1.5; // 50% buffer
      
      for (const item of devFormatKeys) {
        if (freedSpace >= targetSpace) break;
        
        localStorage.removeItem(item.key);
        freedSpace += item.size;
        console.log(`Removed old data: ${item.key} (${item.size} bytes)`);
      }
      
      // Try to save the new data
      localStorage.setItem(newKey, newData);
      console.log(`Successfully saved after cleanup: ${newKey}`);
      return true;
      
    } catch (error) {
      console.error('Cleanup failed:', error);
      return false;
    }
  }

  /**
   * Check storage quota and warn if approaching limits
   */
  checkStorageQuota() {
    const info = this.getStorageInfo();
    const usagePercentage = (info.usedSpace / this.maxSize) * 100;
    
    if (usagePercentage > 80) {
      console.warn(`Storage usage high: ${usagePercentage.toFixed(1)}% (${info.usedSpace} bytes)`);
    }
  }

  /**
   * Serialize data for storage with metadata
   * @param {any} data - Data to serialize
   * @returns {string} Serialized data with metadata
   */
  serializeData(data) {
    try {
      const wrapper = {
        version: '1.0',
        timestamp: Date.now(),
        data: data
      };
      
      return JSON.stringify(wrapper);
    } catch (error) {
      // Handle circular references and other JSON serialization errors
      if (error.message.includes('circular') || error.message.includes('Converting circular structure')) {
        throw new Error('Cannot serialize circular references');
      }
      throw error;
    }
  }

  /**
   * Deserialize data from storage
   * @param {string} serializedData - Serialized data string
   * @returns {any} Deserialized data
   */
  deserializeData(serializedData) {
    try {
      const parsed = JSON.parse(serializedData);
      
      // Handle new format with metadata
      if (parsed.version && parsed.data !== undefined) {
        return parsed.data;
      }
      
      // Handle legacy format (direct data)
      return parsed;
    } catch (error) {
      // If JSON parsing fails, return as string
      return serializedData;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.storageCheckInterval) {
      clearInterval(this.storageCheckInterval);
    }
  }
}