import react from '@vitejs/plugin-react-swc';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// 自定义插件：修复所有 file:// 协议问题
function fileProtocolPlugin() {
  return {
    name: 'file-protocol-plugin',
    
    // 1. 修复 index.html 中的空格问题并移除 crossorigin
    transformIndexHtml(html: string) {
      return html
        // 修复空格问题（确保属性间有空格）
        .replace(/(<script[^>]+?)(?=src)/g, '$1 ')
        // 移除 type="module" 和 crossorigin
        .replace(/\s*type="module"\s*/g, ' ')
        .replace(/\s*crossorigin\s*/g, ' ')
        // 添加 defer 属性确保 DOM 加载完成
        .replace(/(<script\s)/g, '$1defer ');
    },
    
    // 2. 构建后处理：确保所有路径正确
    closeBundle() {
      const indexPath = resolve(__dirname, 'dist', 'index.html');
      let html = readFileSync(indexPath, 'utf-8');
      
      // 确保 #root 元素存在
      if (!html.includes('id="root"')) {
        html = html.replace(
          /<body>(.*?)<\/body>/s,
          `<body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            $1
          </body>`
        );
      }
      
      writeFileSync(indexPath, html);
      console.log('✅ Fixed index.html for file:// protocol');
    }
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
        // 添加全局对象修复
        intro: `
          // 解决 #root 元素未找到问题
          document.addEventListener('DOMContentLoaded', function() {
            if (!document.getElementById('root')) {
              const rootEl = document.createElement('div');
              rootEl.id = 'root';
              document.body.appendChild(rootEl);
              console.warn('Created #root element dynamically');
            }
          });
          
          // 解决全局对象问题
          var global = window;
          var process = { env: {} };
        `
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    assetsInlineLimit: 0,
    // 禁用压缩以解决 "unreachable code" 错误
    minify: false,
    // 禁用 CSS 代码拆分
    cssCodeSplit: false,
  },
  plugins: [
    react({
      jsxImportSource: 'react',
      // 简化 Babel 配置
      babel: undefined
    }),
    fileProtocolPlugin()
  ],
  esbuild: {
    keepNames: true,
    jsx: 'automatic',
    // 确保不注入模块导入
    jsxInject: undefined
  },
} as UserConfig);
