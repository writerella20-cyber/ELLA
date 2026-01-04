
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // @ts-ignore process is defined in node
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.API_KEY || process.env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Define specific key first to ensure replacement
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Define global process object to prevent "process is not defined" crashes
      'process': {
        env: {
          API_KEY: apiKey,
          NODE_ENV: mode
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
