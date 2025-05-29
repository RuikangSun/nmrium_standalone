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
    base: './',
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
          // 关键修改 1：禁用内联动态导入（解决与 manualChunks 的冲突）
          inlineDynamicImports: false,
          // 关键修改 2：输出格式改为 umd（兼容模块化和非模块化环境）
          format: 'umd',
          // 关键修改 3：指定全局变量名（umd 格式需要）
          name: 'NMRiumApp',
          manualChunks(id) {
            if (id.includes('node_modules/openchemlib/')) {
              return 'openchemlib';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
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
