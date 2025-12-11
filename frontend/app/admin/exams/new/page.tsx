// // app/admin/exam/new/page.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
// import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";

// import { useRouter } from "next/navigation";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { apiFetch } from "@/lib/api";
// import { useToast } from "@/components/ui/use-toast";
// import { Skeleton } from "@/components/ui/skeleton";

// interface Question {
//   _id: string;
//   title?: string; // Listening
//   question?: string; // Speaking, Writing
//   passageNumber?: string; // Reading
//   type: string;
//   difficulty: string;
//   createdAt: string;
//   // ... các field khác tùy skill
// }

// export default function NewExamPage() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [duration, setDuration] = useState("180");
//   const [selectedQuestions, setSelectedQuestions] = useState<{
//     listening: string[];
//     reading: string[];
//     writing: string[];
//     speaking: string[];
//   }>({
//     listening: [],
//     reading: [],
//     writing: [],
//     speaking: [],
//   });
//   const [questions, setQuestions] = useState<{
//     listening: Question[];
//     reading: Question[];
//     writing: Question[];
//     speaking: Question[];
//   }>({
//     listening: [],
//     reading: [],
//     writing: [],
//     speaking: [],
//   });
//   const [loading, setLoading] = useState(false);
//   const [questionsLoading, setQuestionsLoading] = useState(true);
//   const { toast } = useToast();
//   const router = useRouter();

//   // Fetch danh sách câu hỏi cho tất cả skill
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const [listening, reading, writing, speaking] = await Promise.all([
//           apiFetch("/admin/questions/listening/listening-questions?limit=100"),
//           apiFetch("/admin/questions/reading/reading-questions?limit=100"),
//           apiFetch("/admin/questions/writing?limit=100"),
//           apiFetch("/admin/questions/speaking?limit=100"),
//         ]);

//         setQuestions({
//           listening: listening.data || [],
//           reading: reading.data || [],
//           writing: writing.data || [],
//           speaking: speaking.data || [],
//         });
//       } catch (err: any) {
//         toast({
//           variant: "destructive",
//           title: "Lỗi",
//           description: err.message || "Không tải được danh sách câu hỏi",
//         });
//       } finally {
//         setQuestionsLoading(false);
//       }
//     };

//     fetchQuestions();
//   }, [toast]);

//   const handleSelect = (
//     skill: keyof typeof selectedQuestions,
//     id: string,
//     checked: boolean
//   ) => {
//     setSelectedQuestions((prev) => ({
//       ...prev,
//       [skill]: checked
//         ? [...prev[skill], id]
//         : prev[skill].filter((q) => q !== id),
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!title.trim()) {
//       toast({
//         variant: "destructive",
//         title: "Lỗi",
//         description: "Tiêu đề là bắt buộc",
//       });
//       return;
//     }

//     const totalSelected = Object.values(selectedQuestions).flat().length;
//     if (totalSelected === 0) {
//       toast({
//         variant: "destructive",
//         title: "Lỗi",
//         description: "Phải chọn ít nhất 1 câu hỏi",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       await apiFetch("/admin/exam", {
//         method: "POST",
//         body: JSON.stringify({
//           title,
//           description: description.trim() || undefined,
//           durationMinutes: Number(duration),
//           skills: selectedQuestions,
//         }),
//       });
//       toast({ title: "Thành công", description: "Tạo đề thi mới thành công" });
//       router.push("/admin/exams");
//     } catch (err: any) {
//       toast({ variant: "destructive", title: "Lỗi", description: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderQuestionTable = (skill: keyof typeof questions) => {
//     if (questionsLoading) {
//       return <Skeleton className="h-64 w-full" />;
//     }

//     const qList = questions[skill];
//     if (qList.length === 0) {
//       return (
//         <p className="text-center py-8 text-muted-foreground">
//           Chưa có câu hỏi nào cho {skill}
//         </p>
//       );
//     }

//     return (
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-12"></TableHead>
//             <TableHead>Title / Question</TableHead>
//             <TableHead>Type</TableHead>
//             <TableHead>Difficulty</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {qList.map((q) => (
//             <TableRow key={q._id}>
//               <TableCell>
//                 <Checkbox
//                   checked={selectedQuestions[skill].includes(q._id)}
//                   onCheckedChange={(checked) =>
//                     handleSelect(skill, q._id, checked as boolean)
//                   }
//                 />
//               </TableCell>
//               <TableCell className="font-medium">
//                 {q.title || q.question || q.passageNumber || "No title"}
//               </TableCell>
//               <TableCell>{q.type}</TableCell>
//               <TableCell>
//                 <Badge
//                   variant={
//                     q.difficulty === "easy"
//                       ? "default"
//                       : q.difficulty === "medium"
//                         ? "secondary"
//                         : "destructive"
//                   }>
//                   {q.difficulty.toUpperCase()}
//                 </Badge>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     );
//   };

//   return (
//     <main className="min-h-screen bg-background">
//       <Navbar />
//       <div className="mt-16 pt-8 pb-20 max-w-7xl mx-auto px-4">
//         <h1 className="text-5xl font-bold mb-8">Tạo Đề Thi Mới</h1>

//         <form onSubmit={handleSubmit} className="space-y-8">
//           <Card>
//             <CardHeader>
//               <CardTitle>Thông tin cơ bản</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div>
//                 <Label htmlFor="title">Tiêu đề đề thi *</Label>
//                 <Input
//                   id="title"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="Đề Thi IELTS Số 1 - Tháng 11/2025"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="desc">Mô tả</Label>
//                 <Textarea
//                   id="desc"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Mô tả ngắn về đề thi..."
//                   rows={3}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="duration">Thời gian làm bài (phút) *</Label>
//                 <Input
//                   id="duration"
//                   type="number"
//                   value={duration}
//                   onChange={(e) => setDuration(e.target.value)}
//                   min="60"
//                   className="w-32"
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Chọn câu hỏi cho từng kỹ năng</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="listening">
//                 <TabsList className="mb-6">
//                   <TabsTrigger value="listening">Listening</TabsTrigger>
//                   <TabsTrigger value="reading">Reading</TabsTrigger>
//                   <TabsTrigger value="writing">Writing</TabsTrigger>
//                   <TabsTrigger value="speaking">Speaking</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="listening">
//                   {renderQuestionTable("listening")}
//                 </TabsContent>
//                 <TabsContent value="reading">
//                   {renderQuestionTable("reading")}
//                 </TabsContent>
//                 <TabsContent value="writing">
//                   {renderQuestionTable("writing")}
//                 </TabsContent>
//                 <TabsContent value="speaking">
//                   {renderQuestionTable("speaking")}
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>

//           <div className="flex gap-4">
//             <Button type="submit" size="lg" disabled={loading}>
//               {loading ? "Đang tạo..." : "Tạo đề thi"}
//             </Button>
//             <Button variant="outline" size="lg" onClick={() => router.back()}>
//               Hủy
//             </Button>
//           </div>
//         </form>
//       </div>
//       <Footer />
//     </main>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import { Headphones, BookOpen, PenTool, Mic, AlertCircle } from "lucide-react";

type Skill = "listening" | "reading" | "writing" | "speaking";

interface Question {
  _id: string;
  title?: string;
  question?: string;
  passageNumber?: string;
  type: string;
  difficulty: string;
}

export default function NewExamPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("180");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load câu hỏi khi chọn kỹ năng
  useEffect(() => {
    if (!selectedSkill) {
      setQuestions([]);
      setQuestionsLoading(false);
      return;
    }

    setQuestionsLoading(true);
    const endpoints: Record<Skill, string> = {
      listening: "/admin/questions/listening/listening-questions?limit=200",
      reading: "/admin/questions/reading/reading-questions?limit=200",
      writing: "/admin/questions/writing?limit=200",
      speaking: "/admin/questions/speaking?limit=200",
    };

    apiFetch(endpoints[selectedSkill])
      .then((res) => {
        setQuestions(res.data || []);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: `Không tải được câu hỏi ${selectedSkill}`,
        });
        setQuestions([]);
      })
      .finally(() => setQuestionsLoading(false));
  }, [selectedSkill, toast]);

  const handleQuestionToggle = (id: string, checked: boolean) => {
    setSelectedQuestions((prev) =>
      checked ? [...prev, id] : prev.filter((q) => q !== id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Nhập tiêu đề đề thi",
      });
      return;
    }

    if (!selectedSkill) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Chọn 1 kỹ năng",
      });
      return;
    }

    if (selectedQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Chọn ít nhất 1 câu hỏi",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        title,
        description: description.trim() || undefined,
        durationMinutes: Number(duration),
        skills: {
          listening: [],
          reading: [],
          writing: [],
          speaking: [],
        },
      };
      payload.skills[selectedSkill] = selectedQuestions;

      await apiFetch("/admin/exam", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast({ title: "Thành công!", description: "Tạo đề thi thành công" });
      router.push("/admin/exams");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.message || "Tạo đề thi thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const skillConfig = {
    listening: {
      icon: Headphones,
      color: "text-blue-600",
      label: "Listening",
      bg: "bg-blue-100",
    },
    reading: {
      icon: BookOpen,
      color: "text-green-600",
      label: "Reading",
      bg: "bg-green-100",
    },
    writing: {
      icon: PenTool,
      color: "text-purple-600",
      label: "Writing",
      bg: "bg-purple-100",
    },
    speaking: {
      icon: Mic,
      color: "text-orange-600",
      label: "Speaking",
      bg: "bg-orange-100",
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mt-16 pt-8 pb-20 max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-8">Tạo Đề Thi Mới</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Thông tin đề thi */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đề thi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Đề thi Listening Practice #15"
                />
              </div>
              <div>
                <Label htmlFor="desc">Mô tả</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Đề luyện tập Listening với 4 phần chuẩn Cambridge..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="duration">Thời gian (phút) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="10"
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chọn kỹ năng - CHỈ ĐƯỢC CHỌN 1 */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn kỹ năng (chỉ chọn 1)</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedSkill || ""}
                onValueChange={(v) => setSelectedSkill(v as Skill)}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(skillConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <Label
                        key={key}
                        className="flex flex-col items-center justify-center p-8 border-2 rounded-2xl cursor-pointer hover:border-primary transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value={key} className="sr-only" />
                        <Icon className={`w-16 h-16 ${config.color} mb-4`} />
                        <span className="text-xl font-bold">
                          {config.label}
                        </span>
                      </Label>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Danh sách câu hỏi */}
          {selectedSkill ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {(() => {
                    const Icon = skillConfig[selectedSkill].icon;
                    return (
                      <Icon
                        className={`w-8 h-8 ${skillConfig[selectedSkill].color}`}
                      />
                    );
                  })()}
                  Câu hỏi {skillConfig[selectedSkill].label} (
                  {selectedQuestions.length} đã chọn)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <AlertCircle className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
                    <p className="text-xl">
                      Chưa có câu hỏi nào cho kỹ năng này
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Câu hỏi</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Độ khó</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((q) => (
                        <TableRow key={q._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedQuestions.includes(q._id)}
                              onCheckedChange={(c) =>
                                handleQuestionToggle(q._id, c as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium max-w-lg">
                            {q.title ||
                              q.question ||
                              q.passageNumber ||
                              "(Không có nội dung)"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{q.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                q.difficulty === "easy"
                                  ? "default"
                                  : q.difficulty === "medium"
                                    ? "secondary"
                                    : "destructive"
                              }>
                              {q.difficulty.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="text-center py-20 text-muted-foreground">
                <div className="w-32 h-32 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center">
                  <AlertCircle className="w-16 h-16" />
                </div>
                <p className="text-2xl font-medium">
                  Chọn 1 kỹ năng để bắt đầu thêm câu hỏi
                </p>
              </CardContent>
            </Card>
          )}

          {/* Nút submit */}
          <div className="flex gap-6 pt-8">
            <Button
              type="submit"
              size="lg"
              className="px-12"
              disabled={
                loading || !selectedSkill || selectedQuestions.length === 0
              }>
              {loading ? "Đang tạo đề thi..." : "Tạo đề thi"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.back()}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
