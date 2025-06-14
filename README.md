# AI Visualizer Demo

An embedded AI visualization tool that allows users to transform room images using AI technology. Features a smooth drawer-style interface with drag & drop upload, real-time processing, and before/after comparison capabilities.

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

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🔧 Development

### Running Tests
```bash
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

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

## 🚀 Deployment

### As Embedded Widget

The tool is designed to be embedded in existing websites:

```html
<!-- Option 1: iframe embed -->
<iframe src="https://your-domain.com/ai-visualizer" 
        width="100%" height="600px"></iframe>

<!-- Option 2: Script embed (future enhancement) -->
<div id="ai-visualizer-root"></div>
<script src="https://your-domain.com/ai-visualizer.js"></script>
```

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
VITE_API_BASE_URL=https://d12qavyo5a8mvc.cloudfront.net
VITE_ENABLE_MOCKS=true
```

## 📊 Performance

- **Bundle Size**: Optimized with code splitting
- **GPU Acceleration**: Animations use transform/opacity
- **Memory Management**: Automatic cleanup prevents leaks
- **60fps Animations**: Smooth 60fps animation performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Upload not working**: Check file type (JPG/PNG only) and size (≤5MB)

**Animation stuttering**: Ensure GPU acceleration is enabled in browser

**API errors**: Verify network connectivity and API endpoint availability

**Memory issues**: The app automatically cleans up resources, but refresh if needed

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

Built with ❤️ using React + TypeScript + Vite
