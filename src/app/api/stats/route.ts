import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Quiz } from "@/models/Quiz";
import { Submission } from "@/models/Submission";

// Force Node.js runtime for MongoDB/Mongoose support
export const runtime = 'nodejs';

// GET /api/stats - Get dashboard statistics for the authenticated teacher
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get all quizzes for this teacher
    const quizzes = await Quiz.find({ creatorId: userId }).select("_id title").lean();
    const quizIds = quizzes.map((q) => q._id);
    const quizMap = new Map(quizzes.map((q) => [String(q._id), q.title]));

    // Get submission stats
    const submissions = await Submission.find({ quizId: { $in: quizIds } })
      .sort({ completedAt: -1 })
      .lean();

    const totalSubmissions = submissions.length;

    // Calculate average score percentage
    let averageScore = 0;
    if (totalSubmissions > 0) {
      const totalPercentage = submissions.reduce((sum, s) => {
        return sum + (s.totalPoints > 0 ? (s.score / s.totalPoints) * 100 : 0);
      }, 0);
      averageScore = totalPercentage / totalSubmissions;
    }

    // Get recent submissions with quiz titles
    const recentSubmissions = submissions.slice(0, 10).map((s) => ({
      _id: s._id,
      studentName: s.studentName,
      quizTitle: quizMap.get(String(s.quizId)) || "Unknown Quiz",
      score: s.score,
      totalPoints: s.totalPoints,
      completedAt: s.completedAt,
    }));

    return NextResponse.json({
      totalQuizzes: quizzes.length,
      totalSubmissions,
      averageScore,
      recentSubmissions,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
