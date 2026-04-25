import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dapaz.taskflow',
  appName: 'Soma ulipo',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#00000000',
    }
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
  }
};

export default config;
