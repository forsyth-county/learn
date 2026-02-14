"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface Question {
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

interface QuestionBuilderProps {
  question: Question;
  index: number;
  onChange: (index: number, question: Question) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const questionTypes = [
  { value: "multiple-choice-single", label: "Multiple Choice (Single)" },
  { value: "multiple-choice-multi", label: "Multiple Choice (Multiple)" },
  { value: "short-answer", label: "Short Answer" },
  { value: "true-false", label: "True/False" },
  { value: "fill-in-blanks", label: "Fill in the Blanks" },
];

export function QuestionBuilder({
  question,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: QuestionBuilderProps) {
  const [expanded, setExpanded] = useState(true);

  const updateQuestion = (updates: Partial<Question>) => {
    onChange(index, { ...question, ...updates });
  };

  const addOption = () => {
    updateQuestion({ options: [...question.options, ""] });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion({ options: newOptions });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion({ options: newOptions });
  };

  const handleTypeChange = (type: Question["type"]) => {
    let newCorrectAnswer: string | string[] = "";
    let newOptions: string[] = [];

    if (type === "true-false") {
      newOptions = ["True", "False"];
      newCorrectAnswer = "True";
    } else if (type === "multiple-choice-single" || type === "multiple-choice-multi") {
      newOptions = ["Option 1", "Option 2", "Option 3", "Option 4"];
      newCorrectAnswer = type === "multiple-choice-multi" ? [] : "";
    }

    updateQuestion({
      type,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    });
  };

  const handleCorrectAnswerToggle = (option: string) => {
    if (question.type === "multiple-choice-multi") {
      const currentAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [];
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter((a) => a !== option)
        : [...currentAnswers, option];
      updateQuestion({ correctAnswer: newAnswers });
    } else {
      updateQuestion({ correctAnswer: option });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="cursor-grab text-white/40 hover:text-white/60">
            <GripVertical className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-white/60">
            Question {index + 1}
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
              className="h-8 w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="h-8 w-8 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Question Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      handleTypeChange(value as Question["type"])
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion({ points: parseInt(e.target.value) || 1 })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={question.text}
                  onChange={(e) => updateQuestion({ text: e.target.value })}
                  placeholder="Enter your question..."
                  className="mt-1"
                />
              </div>

              {/* Options for multiple choice and true/false */}
              {(question.type === "multiple-choice-single" ||
                question.type === "multiple-choice-multi" ||
                question.type === "true-false") && (
                <div>
                  <Label className="mb-2 block">
                    Options{" "}
                    <span className="text-white/40">
                      (click to mark as correct)
                    </span>
                  </Label>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <div
                          onClick={() => handleCorrectAnswerToggle(option)}
                          className={`flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-all ${
                            (Array.isArray(question.correctAnswer)
                              ? question.correctAnswer.includes(option)
                              : question.correctAnswer === option)
                              ? "border-green-500 bg-green-500/20"
                              : "border-white/20 hover:border-white/40"
                          }`}
                        >
                          {(Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.includes(option)
                            : question.correctAnswer === option) && (
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                        </div>
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(optionIndex, e.target.value)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          className="flex-1"
                          disabled={question.type === "true-false"}
                        />
                        {question.type !== "true-false" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(optionIndex)}
                            disabled={question.options.length <= 2}
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {question.type !== "true-false" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Correct answer for short answer and fill in blanks */}
              {(question.type === "short-answer" ||
                question.type === "fill-in-blanks") && (
                <div>
                  <Label>Correct Answer</Label>
                  <Input
                    value={
                      Array.isArray(question.correctAnswer)
                        ? question.correctAnswer[0] || ""
                        : question.correctAnswer
                    }
                    onChange={(e) =>
                      updateQuestion({ correctAnswer: e.target.value })
                    }
                    placeholder="Enter the correct answer..."
                    className="mt-1"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Student answers will be compared case-insensitively
                  </p>
                </div>
              )}

              {/* Explanation */}
              <div>
                <Label>
                  Explanation{" "}
                  <span className="text-white/40">(shown after submission)</span>
                </Label>
                <Textarea
                  value={question.explanation || ""}
                  onChange={(e) =>
                    updateQuestion({ explanation: e.target.value })
                  }
                  placeholder="Explain the correct answer..."
                  className="mt-1"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

interface QuestionListProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function QuestionList({ questions, onChange }: QuestionListProps) {
  const handleQuestionChange = (index: number, question: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    onChange(newQuestions);
  };

  const handleRemove = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    [newQuestions[index - 1], newQuestions[index]] = [
      newQuestions[index],
      newQuestions[index - 1],
    ];
    onChange(newQuestions);
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [
      newQuestions[index + 1],
      newQuestions[index],
    ];
    onChange(newQuestions);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      type: "multiple-choice-single",
      text: "",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "",
      points: 1,
    };
    onChange([...questions, newQuestion]);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {questions.map((question, index) => (
          <QuestionBuilder
            key={question._id || index}
            question={question}
            index={index}
            onChange={handleQuestionChange}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={index === 0}
            isLast={index === questions.length - 1}
          />
        ))}
      </AnimatePresence>

      <Button onClick={addQuestion} variant="outline" className="w-full">
        <Plus className="h-5 w-5 mr-2" />
        Add Question
      </Button>
    </div>
  );
}
