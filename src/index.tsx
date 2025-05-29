import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Main from './demo/layouts/Main.js';
import TestHighlight from './demo/test/TestHighlight.js';
import Test from './demo/views/Test.js';

// Reset styles so they do not affect development of the React component.
import 'modern-normalize/modern-normalize.css';
import 'react-science/styles/preflight.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';

import './demo/index.css';

// 确保 DOM 完全加载后再初始化应用
function initApp() {
  // 尝试获取 root 元素，如果不存在则创建
  let rootElement = document.getElementById('root');
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
    console.warn('Created #root element dynamically');
  }

  const root = createRoot(rootElement);
  root.render(
    <HashRouter>
      <Routes>
        <Route path="test">
          <Route path="" element={<Test />} />
          <Route path="highlight" element={<TestHighlight />} />
        </Route>
        <Route path="*" element={<Main />} />
      </Routes>
    </HashRouter>
  );
}

// 多种初始化方式确保执行
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initApp, 0);
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}

// 添加全局对象 polyfill
if (typeof window.global === 'undefined') {
  window.global = window;
}
window.process = { env: {} };
