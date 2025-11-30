"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Star, Shield, Users } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng ký thất bại!");
      }

      alert("Đăng ký thành công!");
      router.push("/login");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Star, text: "Premium Content", delay: 0 },
    { icon: Users, text: "Study Groups", delay: 1 },
    { icon: Shield, text: "Certified Exams", delay: 2 },
  ];

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden order-2 lg:order-1">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-pink-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="text-muted-foreground text-lg">
              Start your 30-day free trial today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium mt-4 transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-semibold text-primary hover:underline inline-flex items-center">
              Sign in <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative bg-zinc-900 text-white overflow-hidden order-1 lg:order-2">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-pink-600 via-purple-600 to-indigo-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        {/* Floating Elements */}
        <div className="absolute inset-0">
          {/* Simulated 3D floating shapes */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl transform -rotate-12"
          />
          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Join the Future of Learning
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-12">
              Experience a new way to master English with our cutting-edge tools and supportive community.
            </p>
          </motion.div>

          <div className="grid gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{feature.text}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}