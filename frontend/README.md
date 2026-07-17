# BharatSathi AI - Frontend

Modern, production-ready React frontend for BharatSathi AI platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Shadcn UI** - High-quality components
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Shadcn UI components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── contexts/           # React contexts
├── types/              # TypeScript types
├── routes/             # Route definitions
├── assets/             # Static assets
├── utils/              # Utility functions
└── lib/                # Library configurations
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Update VITE_API_BASE_URL if needed
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=BharatSathi AI
VITE_APP_VERSION=1.0.0
```

## Features

- ✅ Modern SaaS design
- ✅ Dark/Light mode
- ✅ Fully responsive
- ✅ TypeScript throughout
- ✅ Production-ready
- ✅ Clean architecture
- ✅ Reusable components
- ✅ API integration ready

## Development Status

- [x] Project initialization
- [x] Tailwind CSS setup
- [ ] Routing setup
- [ ] API client configuration
- [ ] Authentication pages
- [ ] Dashboard
- [ ] AI Chat interface
- [ ] Module pages (Schemes, Healthcare, Agriculture, Career)
- [ ] Profile & Settings
- [ ] Dark mode implementation
- [ ] Animations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

This is a portfolio project. Code follows production standards.

## License

Created for educational and portfolio purposes.
