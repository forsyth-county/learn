// Script to seed the database with a sample quiz
import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://blakeflyz1_db_user:mEoHlE8fi7lVQeab@forsythtimestorage.n8i4ngt.mongodb.net/learnforsyth?retryWrites=true&w=majority&appName=ForsythTimeStorage";

// Quiz Schema
const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["multiple-choice-single", "multiple-choice-multi", "short-answer", "true-false", "fill-in-blanks", "matching"],
    required: true,
  },
  text: { type: String, required: true },
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  points: { type: Number, default: 1 },
  explanation: String,
  imageUrl: String,
});

const ThemeSchema = new mongoose.Schema({
  primaryColor: { type: String, default: "#14b8a6" },
  accentColor: { type: String, default: "#06b6d4" },
  fontFamily: { type: String, default: "Inter" },
  backgroundStyle: { type: String, default: "gradient" },
  customWelcomeText: String,
  customInstructions: String,
  customThankYouText: String,
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: String,
  creatorId: { type: String, required: true },
  questions: [QuestionSchema],
  startDate: Date,
  endDate: Date,
  timeLimit: Number,
  maxAttempts: Number,
  theme: { type: ThemeSchema, default: () => ({}) },
  shareableLinkId: { type: String, required: true, unique: true },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);

    // Check if sample quiz already exists
    const existing = await Quiz.findOne({ shareableLinkId: "sample-math-quiz" });
    if (existing) {
      console.log("Sample quiz already exists:", existing.shareableLinkId);
      await mongoose.disconnect();
      return;
    }

    // Create sample quiz
    const sampleQuiz = new Quiz({
      title: "Sample Math Quiz",
      description: "A sample quiz to test the LearnForsyth platform",
      subject: "Mathematics",
      creatorId: "sample-teacher-001",
      shareableLinkId: "sample-math-quiz",
      isPublished: true,
      timeLimit: 10, // 10 minutes
      theme: {
        primaryColor: "#14b8a6",
        accentColor: "#06b6d4",
        fontFamily: "Inter",
        backgroundStyle: "gradient",
        customWelcomeText: "Welcome to this sample math quiz!",
        customInstructions: "Answer all questions to the best of your ability. Good luck!",
        customThankYouText: "Thank you for completing the quiz!",
      },
      questions: [
        {
          type: "multiple-choice-single",
          text: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          points: 1,
          explanation: "2 + 2 equals 4",
        },
        {
          type: "multiple-choice-single",
          text: "What is the square root of 16?",
          options: ["2", "4", "8", "16"],
          correctAnswer: "4",
          points: 1,
          explanation: "The square root of 16 is 4 because 4 × 4 = 16",
        },
        {
          type: "true-false",
          text: "The sum of angles in a triangle is 180 degrees.",
          options: ["True", "False"],
          correctAnswer: "True",
          points: 1,
          explanation: "This is a fundamental property of triangles in Euclidean geometry.",
        },
        {
          type: "multiple-choice-single",
          text: "What is 5 × 7?",
          options: ["30", "35", "40", "45"],
          correctAnswer: "35",
          points: 1,
          explanation: "5 × 7 = 35",
        },
        {
          type: "short-answer",
          text: "What is 100 divided by 5?",
          correctAnswer: "20",
          points: 2,
          explanation: "100 ÷ 5 = 20",
        },
      ],
    });

    await sampleQuiz.save();
    console.log("Sample quiz created with slug:", sampleQuiz.shareableLinkId);
    console.log("Quiz ID:", sampleQuiz._id);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
