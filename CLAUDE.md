# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arma tu Parche is a mobile-first social matching web application for connecting friends and discovering mutual interests in date/activity plans. Users connect via unique PIN codes and can "like" plans together, creating matches when both parties are interested.

## Technology Stack

- **Frontend**: React 19.1.0 with TypeScript, Vite 7.0.0
- **UI Framework**: Tailwind CSS 4.1.10 with shadcn/ui components (Radix UI)
- **Backend**: Firebase 11.9.1 (Authentication + Firestore database)
- **Icons**: Lucide React
- **Authentication**: Google OAuth via Firebase

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture Overview

### Core Structure
- **Mobile-first design** with 384px max-width container
- **Feature-based architecture** organized around 5 main screens
- **Firebase-powered** real-time data synchronization
- **Card-based UI** with gradient-heavy design system

### Main Application Screens
1. **Home** (`/`) - Main dashboard showing available dates/plans
2. **Friends** (`/friends`) - PIN-based friend connections and management
3. **Matches** (`/matches`) - Mutual interests between connected users
4. **Profile** (`/profile`) - User profile and settings
5. **Login** (`/login`) - Google OAuth authentication
6. **Config** (`/config`) - Admin-only date/plan management

### Data Model
- **Users**: Profiles, connections, unique PINs, roles (user/admin)
- **Dates**: Admin-curated activity plans with categories and descriptions
- **Likes**: Individual user preferences on dates
- **Matches**: Created when connected users both like the same date

### Key Components

#### Core UI Components (`src/components/ui/`)
Built on shadcn/ui and Radix UI primitives:
- `Button`, `Card`, `Input`, `Avatar`, `Badge`, `Dialog`, `Toast`
- Custom styled with Tailwind CSS variants

#### Feature Components (`src/components/`)
- `Header` - Navigation with user avatar and screen title
- `DateCard` - Interactive date/plan display with like functionality
- `UserCard` - Friend profile display
- `ConnectionPIN` - PIN-based friend connection system

#### Contexts (`src/contexts/`)
- `AuthContext` - Firebase authentication state management
- `UserContext` - Current user data and profile management

### Firebase Configuration

#### Authentication
- Google OAuth provider configured
- User profiles automatically created on first login
- Role-based access control (user/admin)

#### Firestore Collections
- `users` - User profiles and connection data
- `dates` - Admin-managed activity plans
- `likes` - User preferences on dates
- `matches` - Mutual interest records

### Development Patterns

#### Path Aliases
- `@/` maps to `./src/` for clean imports
- Use `@/components`, `@/contexts`, `@/lib`, etc.

#### Component Patterns
- Functional components with TypeScript interfaces
- Custom hooks for Firebase operations (`useAuth`, `useUser`)
- Consistent error handling with toast notifications
- Mobile-responsive design principles

#### State Management
- React Context for global state (auth, user data)
- Local component state for UI interactions
- Firebase real-time listeners for data synchronization

### Styling System

#### Tailwind Configuration
- Custom color palette with gradients
- Mobile-first responsive breakpoints
- Component-based utility patterns

#### Design Tokens
- Primary gradients: `bg-gradient-to-r from-pink-500 to-violet-500`
- Card styling: `bg-white/10 backdrop-blur-lg border border-white/20`
- Interactive states with hover and active variants

### Security Considerations
- Firebase security rules enforce user data isolation
- Role-based access for admin functions
- PIN-based connections prevent unauthorized friend requests
- Google OAuth for secure authentication

### Common Development Tasks

#### Adding New Date/Plan Categories
1. Update Firestore `dates` collection via Config screen
2. Categories are dynamically displayed on Home screen

#### Implementing New Matching Logic
- Extend `matches` collection structure
- Update real-time listeners in Matches screen
- Consider notification system for new matches

#### UI Component Development
- Follow shadcn/ui patterns for consistency
- Use Tailwind utility classes over custom CSS
- Maintain mobile-first responsive design
- Test interactive states (hover, focus, active)