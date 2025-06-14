# AI Visualizer Demo

An embedded AI visualization tool that allows users to transform images using AI technology.

## Features

- Drag & drop or click to upload images
- Real-time AI image processing
- Smooth animations and transitions
- Responsive design
- Progress tracking
- Before/After image comparison

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- React Query

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Project Structure

```
src/
  ├── components/     # React components
  ├── hooks/         # Custom React hooks
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  ├── api/           # API integration
  └── styles/        # Global styles
```

## API Integration

The demo uses the following endpoints:
- POST /api/start_work
- GET /taskresult/{task_id}

Base URL: https://d12qavyo5a8mvc.cloudfront.net

## Development

- Use `npm run dev` for local development
- The app will be available at `http://localhost:5173`
- Hot Module Replacement (HMR) is enabled by default

## Testing

- Unit tests are written using Jest and React Testing Library
- Run tests with `npm test`
- Coverage reports are generated automatically