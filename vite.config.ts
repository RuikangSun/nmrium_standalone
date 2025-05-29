import react from '@vitejs/plugin-react-swc';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

// 自定义插件：移除 index.html 中的 module 和 crossorigin 属性
function removeModuleAttribute() {
  return {
    name: 'remove-module-attribute',
    transformIndexHtml(html: string) {
      return html
        .replace(/\s*type="module"\s*/g, '')
        .replace(/\s*crossorigin\s*/g, '');
    },
  };
}

export default defineConfig({
  base: './',
  build: {
    target: 'es2015',
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'NMRiumApp',
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        // 关键：添加全局命名空间声明
        intro: 'const global = window;'
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    assetsInlineLimit: 0,
    // 关键：禁用 CSS 代码拆分
    cssCodeSplit: false,
    // 关键：禁用最小化以简化调试
    minify: false,
  },
  plugins: [
    react({
      jsxImportSource: 'react',
      // 移除 Babel 插件（使用默认转换）
      babel: undefined
    }),
    // 应用自定义插件
    removeModuleAttribute()
  ],
  esbuild: {
    keepNames: true,
    jsx: 'automatic',
    // 移除 JSX 注入（避免 ES6 导入）
    jsxInject: undefined
  },
} as UserConfig);
