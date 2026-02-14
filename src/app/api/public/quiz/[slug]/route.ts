import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { Submission } from "@/models/Submission";
import { sanitizeInput, hashIP, calculateScore } from "@/lib/utils";

// Force Node.js runtime for MongoDB/Mongoose support
export const runtime = 'nodejs';

// Rate limiting for public endpoints (stricter)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const ipLimit = rateLimitMap.get(ip);

  if (!ipLimit || now > ipLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (ipLimit.count >= RATE_LIMIT) {
    return false;
  }

  ipLimit.count++;
  return true;
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/public/quiz/[slug] - Get public quiz by shareable link
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    await connectToDatabase();

    const quiz = await Quiz.findOne({
      shareableLinkId: slug,
      isPublished: true,
    }).lean();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check date restrictions
    const now = new Date();
    if (quiz.startDate && new Date(quiz.startDate) > now) {
      return NextResponse.json(
        { error: "This quiz has not started yet" },
        { status: 403 }
      );
    }
    if (quiz.endDate && new Date(quiz.endDate) < now) {
      return NextResponse.json(
        { error: "This quiz has ended" },
        { status: 403 }
      );
    }

    // Return quiz without correct answers
    const publicQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      timeLimit: quiz.timeLimit,
      theme: quiz.theme,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        type: q.type,
        text: q.text,
        options: q.options,
        points: q.points,
        imageUrl: q.imageUrl,
        // DO NOT include correctAnswer
      })),
    };

    return NextResponse.json({ quiz: publicQuiz });
  } catch (error) {
    console.error("Failed to fetch public quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// POST /api/public/quiz/[slug] - Submit quiz answers
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.studentName || typeof body.studentName !== "string") {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 }
      );
    }

    if (!body.answers || typeof body.answers !== "object") {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the full quiz with answers for grading
    const quiz = await Quiz.findOne({
      shareableLinkId: slug,
      isPublished: true,
    }).lean();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check date restrictions
    const now = new Date();
    if (quiz.startDate && new Date(quiz.startDate) > now) {
      return NextResponse.json(
        { error: "This quiz has not started yet" },
        { status: 403 }
      );
    }
    if (quiz.endDate && new Date(quiz.endDate) < now) {
      return NextResponse.json(
        { error: "This quiz has ended" },
        { status: 403 }
      );
    }

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Calculate score
    const questionsWithIds = quiz.questions.map((q) => ({
      _id: String(q._id),
      type: q.type,
      correctAnswer: q.correctAnswer,
      points: q.points || 1,
    }));

    const score = calculateScore(body.answers, questionsWithIds);

    // Sanitize inputs
    const studentName = sanitizeInput(body.studentName).substring(0, 100);
    const studentIdentifier = body.studentIdentifier
      ? sanitizeInput(body.studentIdentifier).substring(0, 50)
      : undefined;

    // Hash IP for abuse prevention (anonymized)
    const ipHash = hashIP(ip);

    // Create submission
    const submission = await Submission.create({
      quizId: quiz._id,
      studentName,
      studentIdentifier,
      answers: body.answers,
      score,
      totalPoints,
      completedAt: new Date(),
      ipHash,
      timeTaken: body.timeTaken,
    });

    // Return results with explanations
    const results = {
      submissionId: submission._id,
      score,
      totalPoints,
      percentage: Math.round((score / totalPoints) * 100),
      thankYouMessage: quiz.theme?.customThankYouText || "Thank you for completing this quiz!",
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        type: q.type,
        correctAnswer: q.correctAnswer,
        userAnswer: body.answers[String(q._id)],
        isCorrect:
          q.type === "multiple-choice-multi"
            ? JSON.stringify(
                Array.isArray(body.answers[String(q._id)])
                  ? body.answers[String(q._id)].sort()
                  : []
              ) ===
              JSON.stringify(
                Array.isArray(q.correctAnswer) ? q.correctAnswer.sort() : []
              )
            : String(body.answers[String(q._id)]).toLowerCase().trim() ===
              String(q.correctAnswer).toLowerCase().trim(),
        points: q.points || 1,
        explanation: q.explanation,
      })),
    };

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
