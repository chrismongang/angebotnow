# Setup Notes - AngebotNow

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/angebotnow"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/angebotnow_shadow"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Sentry (optional)
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

## Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Run e2e tests
npm run e2e
```

## Database

```bash
# Open Prisma Studio
npm run prisma:studio

# Reset database
npx prisma migrate reset
```

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```
