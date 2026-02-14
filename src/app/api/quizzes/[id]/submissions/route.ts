import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { Submission } from "@/models/Submission";
import mongoose from "mongoose";

// Force Node.js runtime for MongoDB/Mongoose support
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/quizzes/[id]/submissions - Get all submissions for a quiz
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

    // Verify ownership
    const quiz = await Quiz.findOne({ _id: id, creatorId: userId }).lean();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const submissions = await Submission.find({ quizId: id })
      .sort({ completedAt: -1 })
      .lean();

    return NextResponse.json({
      submissions,
      quiz: {
        title: quiz.title,
        questions: quiz.questions,
      },
    });
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id]/submissions - Delete all submissions for a quiz
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

    // Verify ownership
    const quiz = await Quiz.findOne({ _id: id, creatorId: userId });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Delete all submissions (GDPR compliance)
    await Submission.deleteMany({ quizId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete submissions:", error);
    return NextResponse.json(
      { error: "Failed to delete submissions" },
      { status: 500 }
    );
  }
}
