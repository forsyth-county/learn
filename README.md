# LearnForsyth

Modern, advanced Interactive Quiz/Assessment Platform exclusively for teachers to create and share quizzes. Students access quizzes via public shareable links without accounts.

## Features

- **Teacher Authentication**: Secure sign-in via Clerk for teachers only
- **Quiz Builder**: Create quizzes with multiple question types (multiple choice, true/false, short answer, fill-in-blanks)
- **Theme Customization**: Custom colors, fonts, and styling for each quiz
- **Shareable Links**: Students access quizzes via unique, unguessable links
- **Auto-Grading**: Instant scoring and feedback upon submission
- **Submission Management**: View, analyze, and export student submissions
- **Privacy-First**: FERPA & GDPR compliant - minimal data collection, no student accounts
- **Error Monitoring**: Sentry integration for error tracking and monitoring

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Authentication**: Clerk (teachers only)
- **Database**: MongoDB with Mongoose
- **UI**: shadcn/ui + Tailwind CSS
- **Animations**: Framer Motion
- **Notifications**: Sonner
- **Monitoring**: Sentry

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Clerk account

### Environment Variables

Create a `.env.local` file with the following variables (see `.env.example`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learnforsyth

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Clerk Webhook Setup

1. In Clerk Dashboard, go to Webhooks
2. Create a new webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Teacher dashboard
│   ├── quizzes/
│   │   ├── new/page.tsx      # Create new quiz
│   │   └── [id]/page.tsx     # Edit quiz
│   ├── take/[slug]/page.tsx  # Public quiz taking
│   └── api/
│       ├── quizzes/          # Quiz CRUD endpoints
│       ├── public/           # Public quiz endpoints
│       ├── stats/            # Dashboard statistics
│       └── webhooks/clerk/   # Clerk webhook handler
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── quiz/                 # Quiz-specific components
├── lib/
│   ├── mongodb.ts            # Database connection
│   ├── theme.ts              # Theme utilities
│   └── utils.ts              # Helper functions
└── models/
    ├── Quiz.ts               # Quiz schema
    ├── Submission.ts         # Submission schema
    └── User.ts               # User schema (synced via Clerk webhooks)
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

## Security Features

- Teacher-only authentication via Clerk
- Rate limiting on all API endpoints
- Input sanitization
- IP hashing for abuse prevention (anonymized)
- No student PII storage beyond name
- Secure webhook verification

## License

MIT
