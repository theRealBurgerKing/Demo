// src/EmbedApp.tsx - 嵌入式应用主组件
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import AIVisualizer from './components/AIVisualizer'
import ResultDrawer from './components/ResultDrawer'

interface EmbedConfig {
  theme?: 'light' | 'dark';
  primaryColor?: string;
  apiBaseUrl?: string;
  autoOpen?: boolean;
}

interface EmbedAppProps {
  initialConfig?: EmbedConfig;
}

function EmbedApp({ initialConfig = {} }: EmbedAppProps) {
  const [config, setConfig] = useState<EmbedConfig>(initialConfig);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // 嵌入版自动打开
  const [isResultDrawerOpen, setIsResultDrawerOpen] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  // 监听配置更新
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      setConfig(event.detail);
    };

    window.addEventListener('embed-config-updated', handleConfigUpdate as EventListener);
    return () => {
      window.removeEventListener('embed-config-updated', handleConfigUpdate as EventListener);
    };
  }, []);

  // 监听来自父页面的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || !event.data.type) {
        return;
      }

      switch (event.data.type) {
        case 'EMBED_OPEN':
          setIsDrawerOpen(true);
          notifyParent('OPENED');
          break;
        case 'EMBED_CLOSE':
          handleCloseDrawer();
          break;
        case 'EMBED_RESET':
          handleReset();
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 应用主题配置
  useEffect(() => {
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    }
    if (config.theme) {
      document.documentElement.setAttribute('data-theme', config.theme);
      document.body.className = config.theme === 'dark' ? 'dark' : '';
    }
  }, [config]);

  // 通知父页面状态变化
  const notifyParent = (type: string, data?: any) => {
    window.parent.postMessage({
      type: `EMBED_${type}`,
      data,
      timestamp: Date.now()
    }, '*');
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setIsResultDrawerOpen(false);
    setResultImage(null);
    setOriginalImage(null);
    notifyParent('CLOSED');
  };

  const handleShowResult = (resultImg: string, originalImg: string) => {
    setIsDrawerOpen(false);
    setResultImage(resultImg);
    setOriginalImage(originalImg);
    setIsResultDrawerOpen(true);
    notifyParent('RESULT_READY', { 
      resultImage: resultImg, 
      originalImage: originalImg 
    });
  };

  const handleCloseResultDrawer = () => {
    setIsResultDrawerOpen(false);
    setResultImage(null);
    setOriginalImage(null);
    notifyParent('RESULT_CLOSED');
  };

  const handleReset = () => {
    setIsDrawerOpen(true);
    setIsResultDrawerOpen(false);
    setResultImage(null);
    setOriginalImage(null);
    notifyParent('RESET');
  };

  // 错误边界处理
  const handleError = (error: Error) => {
    console.error('Embed App Error:', error);
    notifyParent('ERROR', {
      message: error.message,
      stack: error.stack
    });
  };

  return (
    <div className="ai-visualizer-embed w-full h-full">
      {/* 错误边界 */}
      <ErrorBoundary onError={handleError}>
        {/* AI 可视化工具 */}
        <AnimatePresence>
          {isDrawerOpen && (
            <AIVisualizer 
              onClose={handleCloseDrawer} 
              onShowResult={handleShowResult}
              // 传递配置到组件
              apiBaseUrl={config.apiBaseUrl}
            />
          )}
        </AnimatePresence>
        
        {/* 结果展示 */}
        <AnimatePresence>
          {isResultDrawerOpen && resultImage && (
            <ResultDrawer 
              open={isResultDrawerOpen} 
              onClose={handleCloseResultDrawer} 
              resultImage={resultImage} 
              originalImage={originalImage || undefined}
            />
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
}

// 简单的错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EmbedApp;