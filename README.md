# Mind Care - AI-Powered Mental Wellness Platform

A comprehensive mental health and wellness platform that provides 24/7 emotional support, mood tracking, and wellness resources through an AI-powered interface.

## Project Overview

Mind Care is designed to make mental health support accessible, affordable, and anonymous. It leverages AI and sentiment analysis to provide real-time emotional support and wellness assistance.

## Features

- **AI Chat Support**: 24/7 emotional support with sentiment-aware responses
- **Mood Tracking**: Daily mood logging with visual charts and trend analysis
- **Wellness Exercises**: Guided meditation, breathing exercises, and daily tips
- **Emergency Support**: Crisis intervention and helpline resources
- **Premium Features**: Video consultations with psychiatrists, habit tracking, and more

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Chart.js (for mood visualizations)
- TensorFlow.js (for sentiment analysis)

### Backend (To be implemented)
- Node.js
- Express.js
- MongoDB

## Project Structure

```
src/
├── components/          # Reusable React components
│   └── layout/         # Layout components (Navbar, Footer, Layout)
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Chat.tsx
│   ├── MoodTracking.tsx
│   ├── Wellness.tsx
│   ├── EmergencySupport.tsx
│   └── Premium.tsx
├── services/           # API and service layer
│   ├── api.ts
│   └── sentimentAnalysis.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions and constants
│   ├── constants.ts
│   └── helpers.ts
├── assets/             # Static assets (images, icons, etc.)
├── App.tsx             # Main App component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

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

## Development Status

Currently implementing frontend pages. Backend integration and AI features will be added in subsequent phases.

## License

This project is part of a Final Year Project (FYP).





