# AI Resume Enhancer - Frontend ✨

> **Note:** This is the frontend branch. Backend implementation is maintained separately.

A modern, responsive frontend for the AI Resume Enhancer platform. Built with React, TypeScript, and GSAP animations, featuring a custom OKLCH color scheme and smooth user interactions.

## 🌟 Features

- **Modern UI/UX** - Beautiful, responsive interface with smooth animations
- **Dark Mode Support** - Custom OKLCH color scheme with light/dark themes
- **Advanced Animations** - Parallax scrolling, staggered entrances, and micro-interactions
- **Fully Responsive** - Mobile-first design with Tailwind CSS
- **Type Safe** - Full TypeScript implementation
- **Component Library** - Built with Shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the frontend branch:
   ```bash
   git clone -b frontend <repository-url>
   cd "AI Enhancer"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **GSAP** - Professional animations
- **Shadcn/ui** - Component library
- **Lucide React** - Icon set

## 📁 Project Structure

```
AI Enhancer/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── hero-section.tsx
│   │   │   ├── features-section.tsx
│   │   │   ├── about-section.tsx
│   │   │   ├── contact-section.tsx
│   │   │   ├── signin-page.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── ui/              # Reusable components
│   │   └── App.tsx
│   ├── styles/
│   │   ├── theme.css            # Color variables
│   │   └── tailwind.css
│   └── main.tsx
└── package.json
```

## ✨ Animation Features

- Parallax scrolling effects
- Staggered entrance animations with elastic/bounce effects
- Smooth page transitions
- Scroll progress indicator
- Hover micro-interactions
- Active section highlighting

## 📱 Pages & Components

### Landing Page
- **Hero Section** - Main banner with animated statistics
- **Features Section** - 6 feature cards
- **About Section** - Team and project info
- **Contact Section** - Contact form

### Authentication
- **Sign In/Sign Up** - Authentication UI (ready for backend integration)

### Navigation
- Sticky header with scroll effects
- Active section highlighting
- Mobile-responsive menu
- Theme toggle

## 🔌 Backend Integration

The frontend is ready for backend connection with integration points in:
- Authentication forms (AWS Cognito ready)
- Contact form submission
- Resume upload functionality

## 👥 Team

**Team KMR**
- Arman Milani
- Ramtin Loghmani

**COMP 2154 - System Development Project**  
George Brown College

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🙏 Acknowledgments

- GSAP - Animation library
- Shadcn/ui - Component primitives
- Tailwind CSS - Styling framework
- AWS Bedrock AI - Backend integration (separate branch)

---

**Status:** ✅ UI Complete | ⏳ Awaiting Backend Integration  
Built with ❤️ by Team KMR
