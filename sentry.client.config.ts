import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://1d89e07b3583c552c00c06dc961d20f0@o4510858004725760.ingest.us.sentry.io/4510858006036480",

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this in production for optimal performance
  tracesSampleRate: 1.0,

  // Enable replay in production to capture user sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Adjust this value in production, or use tracesSampler for greater control
  // Setting this to 1.0 will send all requests
  debug: false,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional replay configuration goes here
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
