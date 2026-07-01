/**
 * UUID and ID generation utilities
 */

/**
 * Generate a UUID v4
 * @returns {string} UUID in format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generate a random ID (shorter than UUID, good for records)
 * @returns {string} Random ID
 */
export const generateId = () => {
  return generateUUID();
};

export default {
  generateUUID,
  generateId,
};
