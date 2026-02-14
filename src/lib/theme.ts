export interface QuizTheme {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundStyle: "solid" | "gradient" | "pattern";
  customWelcomeText?: string;
  customInstructions?: string;
  customThankYouText?: string;
}

export const defaultTheme: QuizTheme = {
  primaryColor: "#14b8a6",
  accentColor: "#06b6d4",
  fontFamily: "Inter",
  backgroundStyle: "gradient",
  customWelcomeText: "Welcome to this quiz!",
  customInstructions: "Answer all questions to the best of your ability.",
  customThankYouText: "Thank you for completing this quiz!",
};

export const fontFamilies = [
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Poppins", value: "Poppins" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Geist Sans", value: "Geist" },
  { label: "Geist Mono", value: "Geist Mono" },
];

export function getBackgroundStyle(
  theme: QuizTheme
): React.CSSProperties {
  switch (theme.backgroundStyle) {
    case "gradient":
      return {
        background: `linear-gradient(135deg, ${theme.primaryColor}15 0%, #09090b 50%, ${theme.accentColor}15 100%)`,
      };
    case "pattern":
      return {
        backgroundImage: `radial-gradient(${theme.primaryColor}20 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        backgroundColor: "#09090b",
      };
    default:
      return {
        backgroundColor: "#09090b",
      };
  }
}

export function applyThemeToDocument(theme: QuizTheme) {
  document.documentElement.style.setProperty("--quiz-primary", theme.primaryColor);
  document.documentElement.style.setProperty("--quiz-accent", theme.accentColor);
  document.documentElement.style.setProperty("--quiz-font", theme.fontFamily);
}
