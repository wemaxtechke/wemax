import { darkTheme } from './dark.js';
import { lightTheme } from './light.js';

export { darkTheme, lightTheme };

export const getTheme = (mode) => {
    return mode === 'dark' ? darkTheme : lightTheme;
};
