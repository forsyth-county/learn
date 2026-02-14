import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion {
  _id?: string;
  type:
    | "multiple-choice-single"
    | "multiple-choice-multi"
    | "short-answer"
    | "true-false"
    | "fill-in-blanks"
    | "matching";
  text: string;
  options: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  imageUrl?: string;
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  subject?: string;
  questions: IQuestion[];
  creatorId: string;
  startDate?: Date;
  endDate?: Date;
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  theme: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    backgroundStyle: "solid" | "gradient" | "pattern";
    customWelcomeText?: string;
    customInstructions?: string;
    customThankYouText?: string;
  };
  shareableLinkId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: [
      "multiple-choice-single",
      "multiple-choice-multi",
      "short-answer",
      "true-false",
      "fill-in-blanks",
      "matching",
    ],
    required: true,
  },
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  points: { type: Number, default: 1 },
  explanation: { type: String },
  imageUrl: { type: String },
});

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String },
    questions: [QuestionSchema],
    creatorId: { type: String, required: true, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
    timeLimit: { type: Number },
    maxAttempts: { type: Number },
    theme: {
      primaryColor: { type: String, default: "#14b8a6" },
      accentColor: { type: String, default: "#06b6d4" },
      fontFamily: { type: String, default: "Inter" },
      backgroundStyle: {
        type: String,
        enum: ["solid", "gradient", "pattern"],
        default: "gradient",
      },
      customWelcomeText: { type: String },
      customInstructions: { type: String },
      customThankYouText: { type: String },
    },
    shareableLinkId: { type: String, required: true, unique: true, index: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
