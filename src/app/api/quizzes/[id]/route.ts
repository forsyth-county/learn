import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { Submission } from "@/models/Submission";
import { sanitizeInput } from "@/lib/utils";
import mongoose from "mongoose";

// Force Node.js runtime for MongoDB/Mongoose support
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/quizzes/[id] - Get a specific quiz
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    await connectToDatabase();

    const quiz = await Quiz.findOne({ _id: id, creatorId: userId }).lean();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update a quiz
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const body = await req.json();

    await connectToDatabase();

    // Verify ownership
    const existingQuiz = await Quiz.findOne({ _id: id, creatorId: userId });
    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Sanitize text inputs
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      updateData.title = sanitizeInput(body.title);
    }
    if (body.description !== undefined) {
      updateData.description = body.description ? sanitizeInput(body.description) : "";
    }
    if (body.subject !== undefined) {
      updateData.subject = body.subject ? sanitizeInput(body.subject) : "";
    }
    if (body.questions !== undefined) {
      // Sanitize question text
      updateData.questions = body.questions.map((q: Record<string, unknown>) => ({
        ...q,
        text: q.text ? sanitizeInput(q.text as string) : "",
        options: Array.isArray(q.options)
          ? q.options.map((opt: string) => sanitizeInput(opt))
          : [],
        explanation: q.explanation ? sanitizeInput(q.explanation as string) : undefined,
      }));
    }
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;
    if (body.timeLimit !== undefined) updateData.timeLimit = body.timeLimit;
    if (body.maxAttempts !== undefined) updateData.maxAttempts = body.maxAttempts;
    if (body.theme !== undefined) {
      updateData.theme = {
        ...body.theme,
        customWelcomeText: body.theme.customWelcomeText
          ? sanitizeInput(body.theme.customWelcomeText)
          : undefined,
        customInstructions: body.theme.customInstructions
          ? sanitizeInput(body.theme.customInstructions)
          : undefined,
        customThankYouText: body.theme.customThankYouText
          ? sanitizeInput(body.theme.customThankYouText)
          : undefined,
      };
    }
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;

    const quiz = await Quiz.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify ownership and delete
    const quiz = await Quiz.findOneAndDelete({ _id: id, creatorId: userId });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Also delete all submissions for this quiz (GDPR compliance)
    await Submission.deleteMany({ quizId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
