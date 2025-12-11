"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

      localStorage.setItem("token", data.token);
      toast.success("Đăng nhập thành công!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chatBubbles = [
    { text: "Hello! 👋", x: -20, y: -20, delay: 0 },
    { text: "Good Morning! ☀️", x: 20, y: 40, delay: 1.5 },
    { text: "How are you? 🤔", x: -30, y: 100, delay: 3 },
    { text: "Nice to meet you! 🤝", x: 40, y: -80, delay: 4.5 },
  ];

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Decorative background elements for form side */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-lg">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? "Logging in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/register" className="font-semibold text-primary hover:underline inline-flex items-center">
              Sign up for free <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative bg-zinc-900 text-white overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        {/* Floating Chat Bubbles */}
        <div className="absolute inset-0 overflow-hidden">
          {chatBubbles.map((bubble, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0, x: bubble.x, y: bubble.y }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1, 1, 0.8],
                y: [bubble.y, bubble.y - 100]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: bubble.delay,
                ease: "easeInOut"
              }}
              className="absolute left-1/2 top-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-lg font-medium shadow-xl"
              style={{ marginLeft: bubble.x, marginTop: bubble.y }}
            >
              {bubble.text}
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8 shadow-2xl">
              <span className="text-4xl">🎓</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Master English with Confidence
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Join a community of learners and take your language skills to the next level with our interactive platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 text-left"
          >
            {[
              "Interactive Lessons",
              "Real-time Practice",
              "Progress Tracking",
              "Community Support"
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-2 bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
