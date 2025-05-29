// vite.config.js
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './', // 保留相对路径
  build: {
    target: 'es2015', // 兼容现代浏览器
    rollupOptions: {
      output: {
        // 关键 1：设置为 iife 格式（非模块化）
        format: 'iife',
        // 关键 2：指定全局变量名（用于挂载应用）
        name: 'NMRiumApp',
        // 关键 3：移除所有代码拆分配置
        manualChunks: undefined,
        // 关键 4：确保输出为 .js 后缀（非 .mjs）
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
    // 关键 5：禁用模块化相关优化
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // 关键 6：明确禁用生成模块标签
    assetsInclude: ['**/*.js'],
  },
  plugins: [react()],
});
