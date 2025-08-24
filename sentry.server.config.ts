import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://placeholder@placeholder.ingest.sentry.io/placeholder',
  tracesSampleRate: 1.0,
  debug: false,
})
