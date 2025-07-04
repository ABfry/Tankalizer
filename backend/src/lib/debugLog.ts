import { env } from '../config/env.js';

const debugLog = (data: any): void => {
  if (env.NODE_ENV === 'development') {
    console.log(data);
  }
};

export { debugLog };
