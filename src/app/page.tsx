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
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Signed In - Redirect to dashboard */}
      {isLoaded && isSignedIn && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500">Redirecting to dashboard...</div>
        </div>
      )}

      {/* Signed Out or Clerk still loading - Landing Page */}
      {(!isLoaded || !isSignedIn) && (
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="flex-1 flex items-center justify-center px-4 py-20">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                  LearnForsyth
                </h1>
                <p className="text-xl md:text-2xl text-zinc-400 mb-4 max-w-2xl mx-auto">
                  Modern Quizzes for Forsyth Educators
                </p>
                <p className="text-base text-zinc-500 mb-10 max-w-xl mx-auto">
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="grid md:grid-cols-3 gap-4 mt-16"
              >
                <GlassCard className="p-5 text-left" padding="none" glow glowColor="teal">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3">
                    <Zap className="h-5 w-5 text-teal-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    Instant Creation
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Build quizzes in minutes with our intuitive builder. Multiple question
                    types, custom themes, and instant sharing.
                  </p>
                </GlassCard>

                <GlassCard className="p-5 text-left" padding="none" glow glowColor="cyan">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    Student-Friendly
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Students access quizzes via shareable links. No accounts needed —
                    just enter their name and start.
                  </p>
                </GlassCard>

                <GlassCard className="p-5 text-left" padding="none" glow glowColor="emerald">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    Privacy-First
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    FERPA & GDPR compliant. Minimal data collection, no tracking,
                    and secure storage of all submissions.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-6 text-center text-zinc-600 text-xs">
            <p>© {new Date().getFullYear()} LearnForsyth. Built for Forsyth County educators.</p>
          </footer>
        </main>
      )}
    </div>
  );
}
