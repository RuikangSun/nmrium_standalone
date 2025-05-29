import react from '@vitejs/plugin-react-swc';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './', // 关键：适配 file:// 协议的相对路径
  build: {
    target: 'es2015', // 兼容现代浏览器（无需模块化）
    modulePreload: false, // 关键 1：禁用模块预加载（避免生成 module 标签）
    rollupOptions: {
      output: {
        format: 'iife', // 关键 2：输出为立即执行函数（非模块化）
        name: 'NMRiumApp', // 关键 3：全局变量名（挂载 React 应用）
        manualChunks: undefined, // 关键 4：关闭代码拆分（iife 不支持多文件）
        entryFileNames: 'assets/[name]-[hash].js', // 确保 JS 后缀为 .js
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true, // 关键 5：强制转换混合 ES 模块为 CommonJS
    },
    assetsInlineLimit: 0, // 禁用小资源内联（避免干扰脚本类型）
  },
  plugins: [
    react({
      // 关键 6：禁用 React 的 JSX 模块化注入（避免生成 module 标签）
      jsxImportSource: 'react',
      babel: {
        plugins: [
          // 可选：转换 JSX 为非模块化调用（如 React.createElement）
          '@babel/plugin-transform-react-jsx',
        ],
      },
    }),
  ],
  esbuild: {
    // 关键 7：禁用 ESBuild 的模块化语法保留
    keepNames: true,
    jsx: 'automatic',
    jsxInject: `import React from 'react'`, // 避免模块导入语句
  },
} as UserConfig);
