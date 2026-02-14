"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { QuizCardSkeleton, LoadingSpinner } from "@/components/LoadingSpinner";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  Users,
  Clock,
  Copy,
} from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  shareableLinkId: string;
  isPublished: boolean;
  questions: Array<{ _id: string }>;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalQuizzes: number;
  totalSubmissions: number;
  averageScore: number;
  recentSubmissions: Array<{
    _id: string;
    studentName: string;
    quizTitle: string;
    score: number;
    totalPoints: number;
    completedAt: string;
  }>;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchQuizzes();
      fetchStats();
    }
  }, [isSignedIn]);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const copyShareableLink = (slug: string) => {
    const link = `${window.location.origin}/take/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    setDeleting(quizId);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (res.ok) {
        setQuizzes(quizzes.filter((q) => q._id !== quizId));
        toast.success("Quiz deleted successfully");
      } else {
        toast.error("Failed to delete quiz");
      }
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setDeleting(null);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-[#0a0a0e]/90 backdrop-blur-xl p-5 flex flex-col">
        <div className="mb-8">
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            LearnForsyth
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.06] text-white text-sm font-medium"
          >
            <BookOpen className="h-4 w-4 text-cyan-400" />
            My Quizzes
          </Link>
        </nav>

        <div className="pt-5 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || "Teacher"}
              </p>
              <p className="text-xs text-white/40 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">My Quizzes</h2>
            <p className="text-white/50 text-sm mt-1">
              Create and manage your assessments
            </p>
          </div>
          <Link href="/quizzes/new">
            <Button variant="glow">
              <Plus className="h-4 w-4 mr-2" />
              Create New Quiz
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-5" padding="none" hover={false}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {stats?.totalQuizzes ?? quizzes.length}
                </p>
                <p className="text-xs text-white/40">Total Quizzes</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" padding="none" hover={false}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {stats?.totalSubmissions ?? 0}
                </p>
                <p className="text-xs text-white/40">Total Submissions</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" padding="none" hover={false}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {stats?.averageScore ? `${Math.round(stats.averageScore)}%` : "—"}
                </p>
                <p className="text-xs text-white/40">Average Score</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <GlassCard className="p-10 text-center" padding="none">
            <BookOpen className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No quizzes yet
            </h3>
            <p className="text-white/50 text-sm mb-6">
              Create your first quiz to get started
            </p>
            <Link href="/quizzes/new">
              <Button variant="glow">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Quiz
              </Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard className="p-6 h-full flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white line-clamp-2">
                        {quiz.title}
                      </h3>
                      {quiz.isPublished && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 shrink-0 ml-2">
                          Published
                        </span>
                      )}
                    </div>
                    {quiz.subject && (
                      <p className="text-sm text-purple-400 mb-2">{quiz.subject}</p>
                    )}
                    {quiz.description && (
                      <p className="text-sm text-white/60 line-clamp-2 mb-3">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {quiz.questions?.length || 0} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(quiz.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                    <Link href={`/quizzes/${quiz._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    {quiz.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareableLink(quiz.shareableLinkId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      disabled={deleting === quiz._id}
                      className="text-red-400 hover:text-red-300 hover:border-red-400/50"
                    >
                      {deleting === quiz._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        {stats?.recentSubmissions && stats.recentSubmissions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Recent Submissions
            </h3>
            <GlassCard className="divide-y divide-white/10">
              {stats.recentSubmissions.slice(0, 5).map((submission) => (
                <div
                  key={submission._id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">
                      {submission.studentName}
                    </p>
                    <p className="text-sm text-white/60">
                      {submission.quizTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {submission.score}/{submission.totalPoints}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(submission.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}
