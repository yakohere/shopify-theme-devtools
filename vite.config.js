import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production';
  
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/scripts/main.js'),
        name: 'ThemeDevtools',
        fileName: () => 'theme-devtools.js',
        formats: ['iife']
      },
      outDir: 'dist',
      emptyOutDir: true,
      cssCodeSplit: false,
      sourcemap: !isProd,
      rollupOptions: {
        output: {
          assetFileNames: 'theme-devtools.[ext]',
          sourcemapExcludeSources: false
        }
      },
      minify: isProd ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true
        },
        format: {
          comments: false
        }
      }
    },
    server: {
      port: 9999,
      strictPort: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    preview: {
      port: 9999,
      strictPort: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  };
});
