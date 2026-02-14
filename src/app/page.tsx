"use client";

import { SignedOut, SignInButton, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Sparkles, Zap } from "lucide-react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const clerk = useClerk();

  useEffect(() => {
    // Show content after a brief delay to handle Clerk loading
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  // Show loading state briefly
  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Signed In - Redirect to dashboard */}
      {isLoaded && isSignedIn && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/60">Redirecting to dashboard...</div>
        </div>
      )}

      {/* Signed Out or Clerk still loading - Landing Page */}
      {(!isLoaded || !isSignedIn) && (
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="flex-1 flex items-center justify-center px-4 py-20">
            <div className="max-w-6xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                  LearnForsyth
                </h1>
                <p className="text-xl md:text-2xl text-white/70 mb-4 max-w-2xl mx-auto">
                  Modern Quizzes for Forsyth Educators
                </p>
                <p className="text-base text-white/40 mb-10 max-w-xl mx-auto">
                  Create beautiful, engaging assessments. Share with students instantly.
                  No student accounts required.
                </p>

                {isLoaded ? (
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="lg" variant="glow" className="text-base px-8 py-5">
                        Sign In as Teacher
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                    </SignInButton>
                  </SignedOut>
                ) : (
                  <Button 
                    size="lg" 
                    variant="glow" 
                    className="text-base px-8 py-5"
                    onClick={() => clerk.openSignIn()}
                  >
                    Sign In as Teacher
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </motion.div>

              {/* Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid md:grid-cols-3 gap-5 mt-16"
              >
                <GlassCard className="p-5 text-left" padding="none">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                    <Zap className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    Instant Creation
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Build quizzes in minutes with our intuitive builder. Multiple question
                    types, custom themes, and instant sharing.
                  </p>
                </GlassCard>

                <GlassCard className="p-5 text-left" padding="none">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    Student-Friendly
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Students access quizzes via shareable links. No accounts needed —
                    just enter their name and start.
                  </p>
                </GlassCard>

                <GlassCard className="p-5 text-left" padding="none">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    Privacy-First
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    FERPA & GDPR compliant. Minimal data collection, no tracking,
                    and secure storage of all submissions.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-6 text-center text-white/30 text-xs">
            <p>© {new Date().getFullYear()} LearnForsyth. Built for Forsyth County educators.</p>
          </footer>
        </main>
      )}
    </div>
  );
}
