import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://1d89e07b3583c552c00c06dc961d20f0@o4510858004725760.ingest.us.sentry.io/4510858006036480",

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production
  tracesSampleRate: 1.0,

  debug: false,
});
