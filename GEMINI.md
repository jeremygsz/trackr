# GEMINI.md - Context & Instructions

This file provides foundational context and instructions for AI agents working on the **trackr** project.

## Project Overview

**trackr** is a modern personal finance tracking application built with the Next.js App Router. It allows users to manage spendings, subscriptions, installments, and bank accounts with a rich, interactive UI.
The app is designed to be intuitive and user-friendly, with a design modern UI/UX approach.
### Core Tech Stack
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescript.org/)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5](https://authjs.dev/) (Credentials Provider, JWT Strategy)
- **Styling:** [Sass (SCSS)](https://sass-lang.com/) & [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Validation:** [Zod](https://zod.dev/)

## Architecture & Directory Structure

- `src/app/`: Next.js App Router pages, layouts, and API routes.
- `src/lib/`: Core utilities and singleton instances (e.g., `prisma.ts`, `auth.ts`).
- `src/styles/`: Global SCSS styling organized by variables, mixins, and utilities.
- `src/types/`: TypeScript type definitions and module augmentations.
- `prisma/`: Database schema and migrations.
- `public/`: Static assets.

## Building and Running

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Prisma: Sync schema with database
npx prisma db push

# Prisma: Generate client
npx prisma generate

# Prisma: Open Studio
npx prisma studio
```

### Production
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Development Conventions

### Coding Standards
- **Strict TypeScript:** Use explicit types where possible; avoid `any`.
- **Component Design:** Prefer functional components and utilize the App Router's server/client component distinction.
- **Styling:**
    - Use SCSS variables from `src/styles/_variables.scss` for consistent theming (colors, spacing, typography).
    - Leverage Tailwind CSS for utility-first styling when appropriate.
- **Authentication:** Use the `auth()` helper from `@/lib/auth` for server-side session checks and `useSession()` for client-side.

### Data Modeling (Prisma)
The project uses a comprehensive schema including:
- **User:** Extended with `firstname`, `lastname`, and `role`.
- **Spending:** One-time expenses with detailed lines (`SpendingLine`) and tags.
- **Subscription:** Recurring expenses with billing cycles.
- **Installment:** Multi-payment purchases with payment schedules (`InstallmentLine`).
- **Classification:** Categories, Subcategories, Stores, and Tags.
- **Bank:** Management of payment methods.

### Testing & Validation
- Use **Zod** for all data validation, especially in API routes and server actions.
- Ensure all database queries are performed through the centralized Prisma client in `src/lib/prisma.ts`.

### Styling
- **Responsive Design:** Utilize scss files responsive classes for layout and responsiveness. NO TAILWIND CSS!
- **Accessibility:** Focus on accessibility and usability,

### Components
- **Reusable Components:** Create reusable components for common UI elements. Components are located in `src/components/`.
- **Pages:** are located in `src/app/`.
- **Layouts:** are located in `src/layouts/`.
- **API Routes:** are located in `src/app/api/`.

### Additionnal Coding Preferences
- **Functional Components:** Use functional components for stateless UI.
- **Hooks:** Use hooks for state management.
- **TypeScript:** Use TypeScript for type safety.
- Do not use Tailwind CSS for styling.
- All pages and components will have their own scss files next to them.