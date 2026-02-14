"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getBackgroundStyle, type QuizTheme } from "@/lib/theme";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  XCircle,
  BookOpen,
} from "lucide-react";

interface Question {
  _id: string;
  type: string;
  text: string;
  options: string[];
  points: number;
  imageUrl?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject?: string;
  timeLimit?: number;
  theme: QuizTheme;
  questions: Question[];
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  thankYouMessage: string;
  questions: Array<{
    _id: string;
    text: string;
    type: string;
    correctAnswer: string | string[];
    userAnswer: string | string[];
    isCorrect: boolean;
    points: number;
    explanation?: string;
  }>;
}

type Stage = "intro" | "quiz" | "results";

export default function TakeQuizPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [studentName, setStudentName] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [results, setResults] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/quiz/${slug}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Quiz not found");
      }
      const data = await res.json();
      setQuiz(data.quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const handleSubmit = useCallback(async () => {
    if (!quiz) return;

    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch(`/api/public/quiz/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentIdentifier: studentIdentifier.trim() || undefined,
          answers,
          timeTaken,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await res.json();
      setResults(data.results);
      setStage("results");
    } catch {
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [quiz, startTime, slug, studentName, studentIdentifier, answers]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Timer effect
  useEffect(() => {
    if (stage !== "quiz" || !quiz?.timeLimit || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, timeLeft, quiz?.timeLimit, handleSubmit]);

  const handleStart = () => {
    if (!studentName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setStartTime(Date.now());
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
    setStage("quiz");
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleMultiAnswer = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] as string[] : [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter((o) => o !== option) };
      }
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" className="text-teal-500" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <GlassCard className="p-8 text-center max-w-md" padding="none">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Quiz Not Found</h1>
          <p className="text-zinc-500 text-sm">{error || "This quiz doesn't exist or is no longer available."}</p>
        </GlassCard>
      </div>
    );
  }

  const theme = quiz.theme;
  const bgStyle = getBackgroundStyle(theme);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        ...bgStyle,
        fontFamily: theme.fontFamily,
      }}
    >
      <AnimatePresence mode="wait">
        {/* Intro Stage */}
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6" padding="none">
              <div className="text-center mb-6">
                <div
                  className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center border"
                  style={{ 
                    backgroundColor: `${theme.primaryColor}10`,
                    borderColor: `${theme.primaryColor}30`
                  }}
                >
                  <BookOpen className="h-6 w-6" style={{ color: theme.primaryColor }} />
                </div>
                <h1 className="text-xl font-bold text-white mb-1">{quiz.title}</h1>
                {quiz.subject && (
                  <p className="text-xs font-medium" style={{ color: theme.accentColor }}>
                    {quiz.subject}
                  </p>
                )}
              </div>

              {theme.customWelcomeText && (
                <p className="text-white/60 text-center text-sm mb-5">
                  {theme.customWelcomeText}
                </p>
              )}

              <div className="space-y-4 mb-5">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{quiz.questions.length} questions</span>
                  {quiz.timeLimit && <span>{quiz.timeLimit} minutes</span>}
                </div>
              </div>

              {theme.customInstructions && (
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <p className="text-sm text-white/60">{theme.customInstructions}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                    style={{
                      borderColor: `${theme.primaryColor}30`,
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="identifier">Student ID (optional)</Label>
                  <Input
                    id="identifier"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="e.g., Class period or student ID"
                    className="mt-1"
                    style={{
                      borderColor: `${theme.primaryColor}30`,
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={handleStart}
                className="w-full mt-6"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                }}
              >
                Start Quiz
              </Button>
            </GlassCard>
          </motion.div>
        )}

        {/* Quiz Stage */}
        {stage === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-white/60">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </p>
                  <Progress
                    value={((currentQuestion + 1) / quiz.questions.length) * 100}
                    className="h-2 mt-2 w-32"
                  />
                </div>
                {timeLeft !== null && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                      timeLeft < 60 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mb-8"
                >
                  {(() => {
                    const q = quiz.questions[currentQuestion];
                    return (
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                          {q.text}
                        </h2>
                        <p className="text-sm text-white/40 mb-6">
                          {q.points} point{q.points !== 1 ? "s" : ""}
                        </p>

                        {/* Multiple Choice Single */}
                        {q.type === "multiple-choice-single" && (
                          <RadioGroup
                            value={answers[q._id] as string || ""}
                            onValueChange={(value) => handleAnswer(q._id, value)}
                            className="space-y-3"
                          >
                            {q.options.map((option, i) => (
                              <div
                                key={i}
                                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                  answers[q._id] === option
                                    ? "border-opacity-100"
                                    : "border-white/10 hover:border-white/20"
                                }`}
                                style={{
                                  borderColor:
                                    answers[q._id] === option
                                      ? theme.accentColor
                                      : undefined,
                                  backgroundColor:
                                    answers[q._id] === option
                                      ? `${theme.accentColor}15`
                                      : undefined,
                                }}
                                onClick={() => handleAnswer(q._id, option)}
                              >
                                <RadioGroupItem value={option} id={`q${q._id}-${i}`} />
                                <Label htmlFor={`q${q._id}-${i}`} className="flex-1 cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {/* Multiple Choice Multi */}
                        {q.type === "multiple-choice-multi" && (
                          <div className="space-y-3">
                            {q.options.map((option, i) => {
                              const currentAnswers = Array.isArray(answers[q._id])
                                ? (answers[q._id] as string[])
                                : [];
                              const isChecked = currentAnswers.includes(option);
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                    isChecked
                                      ? "border-opacity-100"
                                      : "border-white/10 hover:border-white/20"
                                  }`}
                                  style={{
                                    borderColor: isChecked ? theme.accentColor : undefined,
                                    backgroundColor: isChecked
                                      ? `${theme.accentColor}15`
                                      : undefined,
                                  }}
                                  onClick={() => handleMultiAnswer(q._id, option, !isChecked)}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) =>
                                      handleMultiAnswer(q._id, option, checked as boolean)
                                    }
                                  />
                                  <Label className="flex-1 cursor-pointer">{option}</Label>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* True/False */}
                        {q.type === "true-false" && (
                          <RadioGroup
                            value={answers[q._id] as string || ""}
                            onValueChange={(value) => handleAnswer(q._id, value)}
                            className="space-y-3"
                          >
                            {["True", "False"].map((option) => (
                              <div
                                key={option}
                                className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                  answers[q._id] === option
                                    ? "border-opacity-100"
                                    : "border-white/10 hover:border-white/20"
                                }`}
                                style={{
                                  borderColor:
                                    answers[q._id] === option
                                      ? theme.accentColor
                                      : undefined,
                                  backgroundColor:
                                    answers[q._id] === option
                                      ? `${theme.accentColor}15`
                                      : undefined,
                                }}
                                onClick={() => handleAnswer(q._id, option)}
                              >
                                <RadioGroupItem value={option} id={`q${q._id}-${option}`} />
                                <Label htmlFor={`q${q._id}-${option}`} className="flex-1 cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {/* Short Answer */}
                        {(q.type === "short-answer" || q.type === "fill-in-blanks") && (
                          <Input
                            value={answers[q._id] as string || ""}
                            onChange={(e) => handleAnswer(q._id, e.target.value)}
                            placeholder="Type your answer..."
                            className="text-lg"
                            style={{
                              borderColor: `${theme.primaryColor}30`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion((prev) => prev - 1)}
                  disabled={currentQuestion === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    }}
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Quiz
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion((prev) => prev + 1)}
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

              {/* Question Navigation Dots */}
              <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                {quiz.questions.map((q, i) => (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestion(i)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      i === currentQuestion
                        ? "text-white"
                        : answers[q._id]
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                    style={{
                      backgroundColor:
                        i === currentQuestion ? theme.primaryColor : undefined,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Results Stage */}
        {stage === "results" && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <div
                  className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    results.percentage >= 70
                      ? "bg-green-500/20"
                      : results.percentage >= 50
                      ? "bg-yellow-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  <span
                    className={`text-3xl font-bold ${
                      results.percentage >= 70
                        ? "text-green-400"
                        : results.percentage >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {results.percentage}%
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {results.thankYouMessage}
                </h1>
                <p className="text-white/60">
                  You scored {results.score} out of {results.totalPoints} points
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Review Your Answers
                </h3>
                {results.questions.map((q, i) => (
                  <div
                    key={q._id}
                    className={`p-4 rounded-xl border ${
                      q.isCorrect
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {q.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">
                          {i + 1}. {q.text}
                        </p>
                        <div className="text-sm space-y-1">
                          <p className="text-white/60">
                            Your answer:{" "}
                            <span className={q.isCorrect ? "text-green-400" : "text-red-400"}>
                              {Array.isArray(q.userAnswer)
                                ? q.userAnswer.join(", ") || "No answer"
                                : q.userAnswer || "No answer"}
                            </span>
                          </p>
                          {!q.isCorrect && (
                            <p className="text-white/60">
                              Correct answer:{" "}
                              <span className="text-green-400">
                                {Array.isArray(q.correctAnswer)
                                  ? q.correctAnswer.join(", ")
                                  : q.correctAnswer}
                              </span>
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-white/50 mt-2 italic">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-white/40">
                        {q.isCorrect ? q.points : 0}/{q.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
