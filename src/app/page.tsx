"use client";

import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from "@clerk/nextjs";
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
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent glow-text">
                  LearnForsyth
                </h1>
                <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-2xl mx-auto">
                  Modern Quizzes for Forsyth Educators
                </p>
                <p className="text-lg text-white/50 mb-12 max-w-xl mx-auto">
                  Create beautiful, engaging assessments. Share with students instantly.
                  No student accounts required.
                </p>

                {isLoaded ? (
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="lg" variant="glow" className="text-lg px-10 py-6">
                        Sign In as Teacher
                        <Sparkles className="ml-2 h-5 w-5" />
                      </Button>
                    </SignInButton>
                  </SignedOut>
                ) : (
                  <Button 
                    size="lg" 
                    variant="glow" 
                    className="text-lg px-10 py-6"
                    onClick={() => clerk.openSignIn()}
                  >
                    Sign In as Teacher
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </motion.div>

              {/* Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid md:grid-cols-3 gap-6 mt-20"
              >
                <GlassCard className="p-6 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Instant Creation
                  </h3>
                  <p className="text-white/60 text-sm">
                    Build quizzes in minutes with our intuitive builder. Multiple question
                    types, custom themes, and instant sharing.
                  </p>
                </GlassCard>

                <GlassCard className="p-6 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Student-Friendly
                  </h3>
                  <p className="text-white/60 text-sm">
                    Students access quizzes via shareable links. No accounts needed —
                    just enter their name and start.
                  </p>
                </GlassCard>

                <GlassCard className="p-6 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Privacy-First
                  </h3>
                  <p className="text-white/60 text-sm">
                    FERPA & GDPR compliant. Minimal data collection, no tracking,
                    and secure storage of all submissions.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 text-center text-white/40 text-sm">
            <p>© {new Date().getFullYear()} LearnForsyth. Built for Forsyth County educators.</p>
          </footer>
        </main>
      )}
    </div>
  );
}
