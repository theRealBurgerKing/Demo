# AI Visualizer Demo

An embedded AI visualization tool that allows users to transform room images using AI technology. Features a smooth drawer-style interface with drag & drop upload, real-time processing, and before/after comparison capabilities.

## 🌐 Live Demo

**🚀 [Try the live demo here](https://ai-visualizer-demo-pjlr60az6-haotian-wangs-projects-abd0efbf.vercel.app/)**

The project is deployed on Vercel and ready to use! Click "Start Your Design Journey" to experience the AI-powered room transformation tool.

## ✨ Features

- **Image Upload**: Drag & drop, click to select, or paste images (JPG/PNG, ≤5MB)
- **Real-time Processing**: AI-powered room transformation with live progress tracking
- **Interactive Comparison**: Before/after slider to compare original and transformed images
- **Smooth Animations**: 300-500ms drawer transitions with Framer Motion
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Resource Management**: Automatic cleanup of requests and memory leaks

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **API Mocking**: MSW (Mock Service Worker)
- **Testing**: Jest + React Testing Library

## 📁 Project Structure

```
├── public/
│   ├── generatedpic.jpg        # Sample generated image
│   └── originalpic.jpg         # Sample original image
├── src/
│   ├── components/
│   │   ├── AIVisualizer.tsx    # Main upload interface
│   │   └── ResultDrawer.tsx    # Result display with comparison
│   ├── mocks/
│   │   ├── browser.ts          # MSW browser setup
│   │   └── handlers.ts         # API mock handlers
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── ai_visualizer_animation_...  # Animation implementation docs
├── *.config.ts                # Configuration files
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd ai-visualizer-demo
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open in browser**:
Visit `http://localhost:5173` to see the application

### Mock API
The application uses MSW to mock the AI processing API:

- **Local Development**: Mocks are automatically enabled
- **Production**: Replace with real API endpoints

#### API Endpoints (Mocked)
```typescript
// Start AI processing task
POST https://d12qavyo5a8mvc.cloudfront.net/api/start_work
Response: { status: 'running', task_id: string }

// Poll for task results
GET https://d12qavyo5a8mvc.cloudfront.net/taskresult/{task_id}
Response: { 
  status: 'running' | 'finished' | 'error',
  result_image_path?: string 
}
```

### Key Components

#### `App.tsx`
- Main application wrapper
- Manages drawer state and body scroll
- Handles navigation between upload and result views

#### `AIVisualizer.tsx` 
- Image upload interface with drag & drop
- File validation (type, size)
- Progress tracking with exponential decay algorithm
- API integration with polling mechanism

#### `ResultDrawer.tsx`
- Before/after image comparison with interactive slider
- Keyboard navigation support
- Download functionality
- Multiple result variations display

## 🎨 Animation Implementation

The app features smooth animations powered by Framer Motion:

- **Drawer Transitions**: 400ms ease-in-out slide from bottom
- **Drag Feedback**: Real-time visual feedback during file drag
- **Progress Animation**: Exponential decay progress simulation
- **Comparison Slider**: Smooth interactive image comparison

For detailed animation implementation, see `ai_visualizer_animation_implementation.md`.

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support with ESC to close
- **Screen Readers**: ARIA labels and live regions for status updates
- **Focus Management**: Proper focus trapping in modal states
- **Color Contrast**: Meets WCAG AA standards

## 🧹 Resource Management

The application implements comprehensive cleanup:

- **AbortController**: Cancels in-flight API requests
- **URL.revokeObjectURL**: Cleans up blob URLs
- **Timer Cleanup**: Clears polling intervals on unmount
- **Scroll Restoration**: Restores body scroll on drawer close


### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---


![image](https://github.com/user-attachments/assets/41089426-e861-4eab-b4af-1cf1c899f61a)


Built with ❤️ using React + TypeScript + Vite
