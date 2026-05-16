"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  Activity,
  BookOpen,
  Trophy,
  Save,
  Loader2,
  Camera,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewPanel } from "@/components/profile/OverviewPanel";
import { HistoryPanel } from "@/components/profile/HistoryPanel";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/user/me")
      .then((data) => {
        setUser(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          password: "",
        });
      })
      .catch((err) => {
        console.error("Lỗi tải profile:", err);
        // alert("Không thể tải thông tin: " + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch("/user/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setUser(updated);
      alert("Cập nhật thành công!");
    } catch (err: any) {
      alert(err.message || "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold text-destructive">
          Không tìm thấy thông tin người dùng
        </h1>
        <Button onClick={() => router.push("/login")}>Đăng nhập lại</Button>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    editor: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
    user: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left Sidebar - User Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-border/50 shadow-lg">
              <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20" />
              <CardContent className="relative pt-0 text-center pb-8">
                <div className="relative -mt-16 mb-4 inline-block">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full shadow-md w-8 h-8"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                <h2 className="text-2xl font-bold text-foreground">
                  {user.name || user.username}
                </h2>
                <p className="text-muted-foreground">@{user.username}</p>

                <div className="mt-4 flex justify-center">
                  <Badge
                    variant="secondary"
                    className={`px-3 py-1 text-sm font-medium capitalize ${roleColors[user.roleId?.name] || roleColors.user
                      }`}
                  >
                    {user.roleId?.name || "Member"}
                  </Badge>
                </div>

                <div className="mt-6 space-y-4 text-left px-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Account Status: Active</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Tabs */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* OVERVIEW CONTENT */}
              <TabsContent value="overview" className="mt-0">
                <OverviewPanel />
              </TabsContent>

              {/* HISTORY CONTENT (NEW) */}
              <TabsContent value="history" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Lịch Sử Làm Bài</h2>
                </div>
                <HistoryPanel />
              </TabsContent>

              {/* SETTINGS CONTENT */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and password.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              value={form.name}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              className="pl-9"
                              placeholder="Your full name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={form.email}
                              onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                              }
                              className="pl-9"
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                            }
                            className="pl-9"
                            placeholder="Leave blank to keep current password"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters long.
                        </p>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="w-full md:w-auto gap-2"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
