import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { nanoid } from "nanoid";
import { sanitizeInput } from "@/lib/utils";

// Force Node.js runtime for MongoDB/Mongoose support
export const runtime = 'nodejs';

// Rate limiting map (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// GET /api/quizzes - List all quizzes for the authenticated teacher
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    await connectToDatabase();

    const quizzes = await Quiz.find({ creatorId: userId })
      .sort({ updatedAt: -1 })
      .select("-questions.correctAnswer") // Don't send answers in list view
      .lean();

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create a new quiz
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();

    // Sanitize inputs
    const title = sanitizeInput(body.title || "Untitled Quiz");
    const description = body.description ? sanitizeInput(body.description) : undefined;
    const subject = body.subject ? sanitizeInput(body.subject) : undefined;

    await connectToDatabase();

    // Generate unique shareable link ID
    const shareableLinkId = nanoid(10);

    const quiz = await Quiz.create({
      title,
      description,
      subject,
      questions: body.questions || [],
      creatorId: userId,
      startDate: body.startDate,
      endDate: body.endDate,
      timeLimit: body.timeLimit,
      maxAttempts: body.maxAttempts,
      theme: body.theme || {
        primaryColor: "#3b82f6",
        accentColor: "#8b5cf6",
        fontFamily: "Inter",
        backgroundStyle: "gradient",
        customWelcomeText: "Welcome to this quiz!",
        customInstructions: "Answer all questions to the best of your ability.",
        customThankYouText: "Thank you for completing this quiz!",
      },
      shareableLinkId,
      isPublished: false,
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
