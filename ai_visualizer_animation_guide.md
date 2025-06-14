# AI 可视化工具动效实现要点文档

## 1. 项目概述

基于提供的代码分析，本文档详细说明了**可嵌入式 AI 可视化工具**中各个动效的实现方案和技术要点。项目使用 React + TypeScript + Framer Motion 技术栈，实现了从抽屉弹出到图片处理完成的完整交互流程。

## 2. 核心动效架构

### 2.1 技术栈选择
```typescript
// 核心依赖
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useRef, useEffect } from 'react'
```

### 2.2 动效状态管理
```typescript
// 动效相关状态
const [isDrawerOpen, setIsDrawerOpen] = useState(false)
const [isResultDrawerOpen, setIsResultDrawerOpen] = useState(false)
const [isDragging, setIsDragging] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [progress, setProgress] = useState<number>(0)
```

## 3. 主要动效实现

### 3.1 抽屉弹出动效 (300-500ms)

#### 背景遮罩动效
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black bg-opacity-50 z-40"
  onClick={onClose}
/>
```

#### 抽屉主体动效
```typescript
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}
  transition={{ duration: 0.4, ease: 'easeInOut' }}
  className="fixed inset-x-0 bottom-0 h-screen bg-white z-50 overflow-auto"
>
```

**实现要点：**
- 使用 `y: '100%'` 实现从底部滑入效果
- `ease: 'easeInOut'` 提供自然的缓动感
- `duration: 0.4` (400ms) 符合 300-500ms 要求
- `z-index` 层级管理确保正确显示顺序

### 3.2 滚动控制实现

```typescript
const handleOpenDrawer = () => {
  setIsDrawerOpen(true)
  document.body.style.overflow = 'hidden' // 禁止滚动
}

const handleCloseDrawer = () => {
  setIsDrawerOpen(false)
  document.body.style.overflow = 'auto' // 恢复滚动
}
```

**技术细节：**
- 抽屉打开时设置 `overflow: hidden` 禁止背景滚动
- 关闭时恢复 `overflow: auto`
- 确保在组件卸载时也能正确恢复

### 3.3 拖拽上传动效

#### 拖拽状态管理
```typescript
const [isDragging, setIsDragging] = useState(false)

const handleDragOver = useCallback((e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(true)
}, [])

const handleDragLeave = useCallback((e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(false)
}, [])
```

#### 视觉反馈实现
```typescript
<div
  className={`w-full flex flex-col items-center justify-center transition-colors ${
    isDragging
      ? 'border-blue-500 bg-blue-50'  // 拖入时高亮
      : ''
  }`}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
>
```

**实现要点：**
- 使用 `transition-colors` 实现平滑颜色过渡
- 拖入时改变边框颜色和背景色
- 拖出时恢复原始状态

### 3.4 加载进度动效

#### 进度条实现
```typescript
{isLoading && (
  <div className="w-full mt-4" role="status" aria-live="polite">
    <div className="w-full bg-gray-200 rounded-full h-2.5" aria-label="Upload progress">
      <div 
        className="bg-blue-500 h-2.5 rounded-full transition-all" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <p className="text-xs text-gray-500 mt-2">Processing... ({progress}%)</p>
  </div>
)}
```

#### 智能进度算法
```typescript
// 使用指数衰减函数模拟进度
const pollResult = (task_id: string) => {
  let elapsed = 0
  const poll = async () => {
    // 指数衰减进度计算：f(t) = e^(-at)
    const t = elapsed / 1000 / 5 // 标准化到5秒范围
    const decay = Math.exp(-3 * t) // a = 3
    const progress = Math.min(100, Math.floor((1 - decay) * 100))
    setProgress(progress)
    // ... 轮询逻辑
  }
}
```

**进度策略：**
- 前期快速增长，后期缓慢推进
- 避免卡在 99% 的糟糕体验
- 任务完成时直接跳到 100%

### 3.5 结果展示动效

#### 滑块比较动效
```typescript
<button
  className="relative bg-white border-2 border-gray-300 rounded-full shadow-lg flex items-center justify-center w-12 h-12 cursor-ew-resize hover:border-blue-400 transition-colors z-10 group"
  onMouseDown={onStart}
  onTouchStart={onStart}
  style={{
    left: `${slider}%`,
    transform: 'translateX(-50%)'
  }}
>
```

#### 图片分割显示
```typescript
// 原图显示区域
<div
  className="absolute inset-0 overflow-hidden"
  style={{
    clipPath: `inset(0 ${100 - slider}% 0 0)`
  }}
>
  <img src={originalImage} alt="Original" />
</div>

// 结果图显示区域
<div
  className="absolute inset-0 overflow-hidden"
  style={{
    clipPath: `inset(0 0 0 ${slider}%)`
  }}
>
  <img src={resultImage} alt="AI Generated Result" />
</div>
```

## 4. 性能优化策略

### 4.1 GPU 加速
```css
.gpu-optimized {
  transform: translateZ(0); /* 强制GPU层 */
  will-change: transform;   /* 提示浏览器优化 */
}
```

### 4.2 避免重排重绘
- 优先使用 `transform` 和 `opacity`
- 避免改变 `width`、`height`、`left`、`top` 等布局属性
- 使用 `position: fixed` 减少重排影响

### 4.3 事件处理优化
```typescript
// 使用 useCallback 避免重复创建函数
const handleDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault()
  setIsDragging(false)
  const file = e.dataTransfer.files[0]
  if (file) {
    handleFileSelect(file)
  }
}, [handleFileSelect])
```

## 5. 可访问性支持

### 5.1 键盘导航
```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
}, [onClose])
```

### 5.2 屏幕阅读器支持
```typescript
// 进度状态播报
<div className="w-full mt-4" role="status" aria-live="polite">

// 错误消息播报
<p className="text-red-500 text-sm mt-2" role="alert" aria-live="assertive">
  {error}
</p>
```

## 6. 资源清理策略

### 6.1 AbortController 使用
```typescript
const abortController = useRef<AbortController | null>(null)

const startTask = async (file: File) => {
  abortController.current = new AbortController()
  
  try {
    const res = await fetch(`${API_BASE}/api/start_work`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortController.current.signal // 关键：传入信号
    })
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      setError(err.message)
    }
  }
}

// 组件卸载时清理
useEffect(() => {
  return () => {
    if (abortController.current) abortController.current.abort()
  }
}, [])
```

### 6.2 内存泄漏防护
```typescript
// 清理对象URL
useEffect(() => {
  return () => {
    if (originalImageUrlRef.current) {
      URL.revokeObjectURL(originalImageUrlRef.current)
    }
  }
}, [])

// 清理定时器
useEffect(() => {
  return () => {
    if (pollingRef.current) clearTimeout(pollingRef.current)
  }
}, [])
```

## 7. 动效调试技巧

### 7.1 Chrome DevTools
```css
/* 动画调试 */
.debug-animation {
  animation-play-state: paused; /* 暂停动画 */
}

/* 显示重绘区域 */
* {
  outline: 1px solid red !important;
}
```

### 7.2 性能监控
```typescript
// 性能标记
performance.mark('animation-start')
// ... 动画代码
performance.mark('animation-end')
performance.measure('animation-duration', 'animation-start', 'animation-end')
```

## 8. 最佳实践总结

### 8.1 动效原则
1. **目的明确**：每个动效都应有明确的用户价值
2. **时长适中**：遵循 300-500ms 的黄金时长
3. **缓动自然**：使用符合物理直觉的缓动函数
4. **性能优先**：优先使用 GPU 加速属性

### 8.2 用户体验
1. **即时反馈**：拖拽、点击等操作立即给出视觉反馈
2. **状态清晰**：Loading、Error、Success 状态要明确区分
3. **可中断性**：长时间操作要支持取消功能
4. **可访问性**：支持键盘导航和屏幕阅读器

### 8.3 技术实现
1. **状态管理**：合理设计动效相关状态
2. **事件处理**：正确处理各种用户交互事件
3. **资源清理**：及时清理定时器、网络请求、对象URL
4. **错误处理**：优雅处理动效执行中的异常情况
