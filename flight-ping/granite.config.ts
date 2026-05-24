import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'flyping',
  plugins: [
    appsInToss({
      brand: {
        displayName: '플라이핑',
        primaryColor: '#2979FF',
        icon: '',
      },
      permissions: [],
    }),
  ],
});