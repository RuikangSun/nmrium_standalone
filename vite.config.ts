import react from '@vitejs/plugin-react-swc';
import analyze from 'rollup-plugin-analyzer';
import type { AliasOptions } from 'vite';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default () => {
  let resolveAliases: AliasOptions = [];
  if (process.env.WITH_PROFILING) {
    resolveAliases = [
      { find: 'react-dom/client', replacement: 'react-dom/profiling' },
      { find: 'scheduler/tracing', replacement: 'scheduler/tracing-profiling' },
    ];
  }

  return defineConfig({
    base: './', // 保留相对路径，适配文件协议
    esbuild: {
      jsx: 'automatic',
      sourcemap: 'inline',
    },
    build: {
      sourcemap: 'inline',
      // 关键修改：调整构建输出格式为非模块化
      target: 'es2015', // 兼容现代浏览器
      rollupOptions: {
        // @ts-expect-error analyzer types are wrong.
        plugins: process.env.ANALYZE ? [analyze()] : [],
        output: {
          // 修改 1：输出格式改为 iife（立即执行函数）或 umd（兼容多种环境）
          format: 'iife', 
          // 修改 2：指定全局变量名（React 应用需要暴露根变量）
          name: 'NMRiumApp', 
          manualChunks(id) {
            if (id.includes('node_modules/openchemlib/')) {
              return 'openchemlib';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // 修改 3：禁用模块化相关属性（如 chunkFileNames 中的 .mjs 后缀）
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      minify: process.env.NO_MINIFY ? false : 'esbuild',
    },
    plugins: [react()],
    resolve: {
      alias: resolveAliases,
    },
    test: {
      include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  });
};
