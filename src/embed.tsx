import React from 'react'
import ReactDOM from 'react-dom/client'
import EmbedApp from './EmbedApp'
import './index.css'

// 嵌入式配置
interface EmbedConfig {
  theme?: 'light' | 'dark';
  primaryColor?: string;
  apiBaseUrl?: string;
  autoOpen?: boolean;
}

// 全局嵌入配置
let embedConfig: EmbedConfig = {};

// 监听来自父页面的配置消息
window.addEventListener('message', (event) => {
  // 基本安全检查
  if (typeof event.data !== 'object' || !event.data.type) {
    return;
  }
  
  console.log('Embed received message:', event.data);
  
  switch (event.data.type) {
    case 'EMBED_CONFIG':
      embedConfig = { ...embedConfig, ...event.data.config };
      // 通知 App 组件配置已更新
      window.dispatchEvent(new CustomEvent('embed-config-updated', { 
        detail: embedConfig 
      }));
      break;
  }
});

// 通知父页面嵌入式应用已准备就绪
window.addEventListener('load', () => {
  window.parent.postMessage({ 
    type: 'EMBED_READY',
    timestamp: Date.now()
  }, '*');
});

// 启用 MSW（如果需要）
async function enableMocking() {
  if (process.env.NODE_ENV === 'development' || import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        // 确保 Service Worker 在嵌入环境中正常工作
        url: '/mockServiceWorker.js'
      }
    })
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <EmbedApp initialConfig={embedConfig} />
    </React.StrictMode>
  )
})