import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHash } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashIP(ip: string): string {
  // Use SHA-256 for secure IP anonymization
  return createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function calculateScore(
  answers: Record<string, string | string[]>,
  questions: Array<{
    _id: string;
    type: string;
    correctAnswer: string | string[];
    points: number;
  }>
): number {
  let totalScore = 0;

  for (const question of questions) {
    const userAnswer = answers[question._id];
    if (!userAnswer) continue;

    if (question.type === "multiple-choice-multi") {
      const correctAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

      const correct =
        correctAnswers.length === userAnswers.length &&
        correctAnswers.every((a) => userAnswers.includes(a));

      if (correct) totalScore += question.points;
    } else {
      const correct =
        String(userAnswer).toLowerCase().trim() ===
        String(question.correctAnswer).toLowerCase().trim();
      if (correct) totalScore += question.points;
    }
  }

  return totalScore;
}
