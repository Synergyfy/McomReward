// src/lib/debug.ts

export const log = (message: string, color: string = 'gray') => {
  console.log(`%c[McomLoyalty Debug] ${message}`, `color: ${color}; font-weight: bold;`);
};

export const logError = (message: string) => {
  log(message, 'red');
};

export const logSuccess = (message: string) => {
  log(message, 'green');
};

export const logWarning = (message: string) => {
  log(message, 'orange');
};
