import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.levelup.gym',
  appName: 'LevelUp Gym',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
