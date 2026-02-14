"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fontFamilies, type QuizTheme } from "@/lib/theme";
import { ChevronDown, ChevronUp, Palette } from "lucide-react";

interface ThemeCustomizerProps {
  theme: QuizTheme;
  onChange: (theme: QuizTheme) => void;
}

export function ThemeCustomizer({ theme, onChange }: ThemeCustomizerProps) {
  const [expanded, setExpanded] = useState(false);

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onChange({ ...theme, ...updates });
  };

  return (
    <GlassCard className="p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Theme Customization</h3>
            <p className="text-sm text-white/60">
              Customize colors, fonts, and messages
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-white/60" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white/60" />
        )}
      </button>

      {expanded && (
        <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
          {/* Colors */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                />
                <Input
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/10"
                />
                <Input
                  value={theme.accentColor}
                  onChange={(e) => updateTheme({ accentColor: e.target.value })}
                  placeholder="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Font and Background */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Font Family</Label>
              <Select
                value={theme.fontFamily}
                onValueChange={(value) => updateTheme({ fontFamily: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Background Style</Label>
              <Select
                value={theme.backgroundStyle}
                onValueChange={(value: "solid" | "gradient" | "pattern") =>
                  updateTheme({ backgroundStyle: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Messages */}
          <div className="space-y-4">
            <div>
              <Label>Welcome Message</Label>
              <Textarea
                value={theme.customWelcomeText || ""}
                onChange={(e) =>
                  updateTheme({ customWelcomeText: e.target.value })
                }
                placeholder="Welcome to this quiz!"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea
                value={theme.customInstructions || ""}
                onChange={(e) =>
                  updateTheme({ customInstructions: e.target.value })
                }
                placeholder="Answer all questions to the best of your ability."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Thank You Message</Label>
              <Textarea
                value={theme.customThankYouText || ""}
                onChange={(e) =>
                  updateTheme({ customThankYouText: e.target.value })
                }
                placeholder="Thank you for completing this quiz!"
                className="mt-1"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="mb-2 block">Preview</Label>
            <div
              className="rounded-xl p-6 border border-white/10"
              style={{
                background:
                  theme.backgroundStyle === "gradient"
                    ? `linear-gradient(135deg, ${theme.primaryColor}30 0%, #0a0a0a 50%, ${theme.accentColor}30 100%)`
                    : theme.backgroundStyle === "pattern"
                    ? `radial-gradient(${theme.primaryColor}20 1px, #0a0a0a 1px)`
                    : "#0a0a0a",
                backgroundSize:
                  theme.backgroundStyle === "pattern" ? "20px 20px" : undefined,
                fontFamily: theme.fontFamily,
              }}
            >
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: theme.primaryColor }}
              >
                Sample Question
              </h4>
              <p className="text-white/80 mb-4">
                What is the capital of France?
              </p>
              <div className="space-y-2">
                {["Paris", "London", "Berlin", "Madrid"].map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 rounded-lg border transition-all cursor-pointer"
                    style={{
                      borderColor:
                        option === "Paris"
                          ? theme.accentColor
                          : "rgba(255,255,255,0.1)",
                      backgroundColor:
                        option === "Paris"
                          ? `${theme.accentColor}20`
                          : "transparent",
                    }}
                  >
                    <span className="text-white/80">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
