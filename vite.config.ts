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
    base: './', // 保留相对路径，适配 file:// 协议
    esbuild: {
      jsx: 'automatic',
      sourcemap: 'inline',
    },
    build: {
      sourcemap: 'inline',
      rollupOptions: {
        // @ts-expect-error analyzer types are wrong.
        plugins: process.env.ANALYZE ? [analyze()] : [],
        output: {
          // 关键修改 1：输出格式改为 iife（单文件非模块化）
          format: 'iife',
          // 关键修改 2：指定全局变量名（用于挂载应用）
          name: 'NMRiumApp',
          // 关键修改 3：移除 manualChunks（关闭代码拆分）
          manualChunks: undefined, 
          // 确保 JS 文件后缀为 .js（兼容 file:// 协议）
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
