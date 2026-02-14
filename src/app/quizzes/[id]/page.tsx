"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { QuestionList, type Question } from "@/components/quiz/QuestionBuilder";
import { ThemeCustomizer } from "@/components/quiz/ThemeCustomizer";
import { defaultTheme, type QuizTheme } from "@/lib/theme";
import {
  ArrowLeft,
  Save,
  Eye,
  Copy,
  Trash2,
  Globe,
  Settings,
  FileText,
  Users,
  Download,
} from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  questions: Question[];
  shareableLinkId: string;
  isPublished: boolean;
  theme: QuizTheme;
  timeLimit?: number;
  maxAttempts?: number;
  startDate?: string;
  endDate?: string;
}

interface Submission {
  _id: string;
  studentName: string;
  studentIdentifier?: string;
  score: number;
  totalPoints: number;
  completedAt: string;
  answers: Record<string, string | string[]>;
}

export default function EditQuizPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState("questions");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch quiz");
      const data = await res.json();
      setQuiz(data.quiz);
    } catch {
      toast.error("Failed to load quiz");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (isSignedIn && id) {
      fetchQuiz();
    }
  }, [isSignedIn, id, fetchQuiz]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/quizzes/${id}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  };

  const handleSave = async (publish = false) => {
    if (!quiz) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quiz,
          isPublished: publish ? true : quiz.isPublished,
        }),
      });

      if (!res.ok) throw new Error("Failed to save quiz");

      const data = await res.json();
      setQuiz(data.quiz);
      toast.success(publish ? "Quiz published!" : "Quiz saved!");
    } catch {
      toast.error("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete quiz");
      toast.success("Quiz deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  const copyShareableLink = () => {
    if (!quiz) return;
    const link = `${window.location.origin}/take/${quiz.shareableLinkId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const exportSubmissionsCSV = () => {
    if (submissions.length === 0) {
      toast.error("No submissions to export");
      return;
    }

    const headers = ["Student Name", "Student ID", "Score", "Total Points", "Percentage", "Completed At"];
    const rows = submissions.map((s) => [
      s.studentName,
      s.studentIdentifier || "",
      s.score.toString(),
      s.totalPoints.toString(),
      `${Math.round((s.score / s.totalPoints) * 100)}%`,
      new Date(s.completedAt).toLocaleString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz?.title || "quiz"}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Submissions exported!");
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-teal-500" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <Input
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="text-xl font-bold bg-transparent border-none px-0 focus:ring-0 h-auto"
                placeholder="Quiz Title"
              />
              <p className="text-sm text-zinc-500">
                {quiz.questions.length} questions •{" "}
                {quiz.isPublished ? "Published" : "Draft"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quiz.isPublished && (
              <Button variant="outline" size="sm" onClick={copyShareableLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            )}
            <a
              href={`/take/${quiz.shareableLinkId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            {!quiz.isPublished && (
              <Button
                variant="glow"
                size="sm"
                onClick={() => handleSave(true)}
                disabled={saving || quiz.questions.length === 0}
              >
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="questions">
                <FileText className="h-4 w-4 mr-2" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="submissions" onClick={fetchSubmissions}>
                <Users className="h-4 w-4 mr-2" />
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              <ThemeCustomizer
                theme={quiz.theme || defaultTheme}
                onChange={(theme) => setQuiz({ ...quiz, theme })}
              />

              <QuestionList
                questions={quiz.questions}
                onChange={(questions) => setQuiz({ ...quiz, questions })}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <GlassCard className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Quiz Settings</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={quiz.subject || ""}
                      onChange={(e) =>
                        setQuiz({ ...quiz, subject: e.target.value })
                      }
                      placeholder="e.g., Mathematics"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="0"
                      value={quiz.timeLimit || ""}
                      onChange={(e) =>
                        setQuiz({
                          ...quiz,
                          timeLimit: parseInt(e.target.value) || undefined,
                        })
                      }
                      placeholder="No limit"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quiz.description || ""}
                    onChange={(e) =>
                      setQuiz({ ...quiz, description: e.target.value })
                    }
                    placeholder="Brief description of your quiz..."
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startDate">Start Date (optional)</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={quiz.startDate?.slice(0, 16) || ""}
                      onChange={(e) =>
                        setQuiz({
                          ...quiz,
                          startDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={quiz.endDate?.slice(0, 16) || ""}
                      onChange={(e) =>
                        setQuiz({
                          ...quiz,
                          endDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Danger Zone
                </h3>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Quiz
                </Button>
              </GlassCard>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Submissions ({submissions.length})
                </h3>
                {submissions.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportSubmissionsCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>

              {submissions.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <Users className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">
                    No submissions yet
                  </h4>
                  <p className="text-zinc-500">
                    Share your quiz to start collecting responses
                  </p>
                </GlassCard>
              ) : (
                <GlassCard className="divide-y divide-zinc-800 overflow-hidden">
                  <div className="grid grid-cols-5 gap-4 p-4 bg-zinc-800/50 text-sm font-medium text-zinc-400">
                    <div>Student Name</div>
                    <div>Student ID</div>
                    <div>Score</div>
                    <div>Percentage</div>
                    <div>Completed</div>
                  </div>
                  {submissions.map((submission) => (
                    <div
                      key={submission._id}
                      className="grid grid-cols-5 gap-4 p-4 text-sm"
                    >
                      <div className="text-white font-medium">
                        {submission.studentName}
                      </div>
                      <div className="text-zinc-500">
                        {submission.studentIdentifier || "—"}
                      </div>
                      <div className="text-white">
                        {submission.score}/{submission.totalPoints}
                      </div>
                      <div
                        className={`font-medium ${
                          (submission.score / submission.totalPoints) >= 0.7
                            ? "text-emerald-400"
                            : (submission.score / submission.totalPoints) >= 0.5
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {Math.round(
                          (submission.score / submission.totalPoints) * 100
                        )}
                        %
                      </div>
                      <div className="text-zinc-500">
                        {new Date(submission.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </GlassCard>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
