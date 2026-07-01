/**
 * Central export for all types and DTOs
 * Import from this file instead of individual files
 */

export * from './enums.js';
export * from './dto.js';

import * as EnumTypes from './enums.js';
import * as DTOTypes from './dto.js';

export const Types = {
    ...EnumTypes,
    ...DTOTypes
};

export default Types;
