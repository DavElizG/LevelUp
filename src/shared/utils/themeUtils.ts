/**
 * Utility functions for applying theme-aware class names
 */

/**
 * Returns theme-aware background classes
 */
export const themeBackground = {
  primary: 'bg-white dark:bg-gray-900 high-contrast:bg-black',
  secondary: 'bg-gray-50 dark:bg-gray-800 high-contrast:bg-gray-900',
  tertiary: 'bg-gray-100 dark:bg-gray-700 high-contrast:bg-gray-800',
  card: 'bg-white dark:bg-gray-800 high-contrast:bg-black',
  glass: 'bg-white/70 dark:bg-gray-800/70 high-contrast:bg-black/90 backdrop-blur-md',
};

/**
 * Returns theme-aware text classes
 */
export const themeText = {
  primary: 'text-gray-900 dark:text-gray-100 high-contrast:text-white',
  secondary: 'text-gray-600 dark:text-gray-300 high-contrast:text-white',
  tertiary: 'text-gray-500 dark:text-gray-400 high-contrast:text-gray-200',
  muted: 'text-gray-400 dark:text-gray-500 high-contrast:text-gray-300',
};

/**
 * Returns theme-aware border classes
 */
export const themeBorder = {
  primary: 'border-gray-200 dark:border-gray-700 high-contrast:border-white',
  secondary: 'border-gray-300 dark:border-gray-600 high-contrast:border-gray-300',
  glass: 'border-white/50 dark:border-gray-700/50 high-contrast:border-white/80',
};

/**
 * Returns theme-aware shadow classes
 */
export const themeShadow = {
  sm: 'shadow-sm dark:shadow-gray-900/20 high-contrast:shadow-white/30',
  md: 'shadow-md dark:shadow-gray-900/30 high-contrast:shadow-white/40',
  lg: 'shadow-lg dark:shadow-gray-900/40 high-contrast:shadow-white/50',
  xl: 'shadow-xl dark:shadow-gray-900/50 high-contrast:shadow-white/60',
};

/**
 * Returns theme-aware gradient classes
 */
export const themeGradient = {
  primary: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 dark:from-orange-400 dark:via-pink-400 dark:to-purple-500 high-contrast:from-orange-600 high-contrast:via-pink-600 high-contrast:to-purple-700',
  orangePink: 'from-orange-500 to-pink-600 dark:from-orange-400 dark:to-pink-500 high-contrast:from-orange-600 high-contrast:to-pink-700',
  blueCyan: 'from-blue-500 to-cyan-600 dark:from-blue-400 dark:to-cyan-500 high-contrast:from-blue-600 high-contrast:to-cyan-700',
  purplePink: 'from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500 high-contrast:from-purple-600 high-contrast:to-pink-700',
};

/**
 * Returns theme-aware input classes
 */
export const themeInput = {
  base: 'bg-white dark:bg-gray-800 high-contrast:bg-black border-gray-300 dark:border-gray-600 high-contrast:border-white text-gray-900 dark:text-gray-100 high-contrast:text-white placeholder-gray-400 dark:placeholder-gray-500 high-contrast:placeholder-gray-400',
  focus: 'focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 high-contrast:focus:ring-4 high-contrast:focus:ring-orange-600 focus:border-orange-400 dark:focus:border-orange-500 high-contrast:focus:border-orange-600',
};

/**
 * Returns theme-aware button classes
 */
export const themeButton = {
  primary: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 dark:from-orange-400 dark:via-pink-400 dark:to-purple-500 dark:hover:from-orange-500 dark:hover:via-pink-500 dark:hover:to-purple-600 text-white',
  secondary: 'bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 high-contrast:hover:bg-gray-700 text-gray-900 dark:text-gray-100 high-contrast:text-white high-contrast:border-2 high-contrast:border-white',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 high-contrast:hover:bg-gray-900 text-gray-700 dark:text-gray-300 high-contrast:text-white',
};

/**
 * Combines multiple theme class strings
 */
export const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
