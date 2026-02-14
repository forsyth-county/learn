import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubmission extends Document {
  quizId: mongoose.Types.ObjectId;
  studentName: string;
  studentIdentifier?: string;
  answers: Record<string, string | string[]>;
  score: number;
  totalPoints: number;
  completedAt: Date;
  ipHash?: string;
  timeTaken?: number; // in seconds
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    studentName: { type: String, required: true },
    studentIdentifier: { type: String },
    answers: { type: Schema.Types.Mixed, required: true },
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    ipHash: { type: String },
    timeTaken: { type: Number },
  },
  { timestamps: true }
);

// Index for finding submissions by quiz
SubmissionSchema.index({ quizId: 1, completedAt: -1 });

export const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);
