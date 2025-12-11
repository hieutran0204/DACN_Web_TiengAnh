// // "use client";

// // import { useEffect, useState } from "react";
// // import { useParams, useRouter } from "next/navigation";
// // import Navbar from "@/components/navbar";
// // import Footer from "@/components/footer";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { ArrowLeft, Save, Upload } from "lucide-react";
// // import Link from "next/link";

// // const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// // interface WritingQuestion {
// //   _id: string;
// //   task: "Task 1" | "Task 2";
// //   type: string;
// //   topic: string;
// //   question: string;
// //   image?: string;
// //   sampleAnswer?: string;
// //   difficulty?: string;
// // }

// // export default function WritingQuestionEdit() {
// //   const router = useRouter();
// //   const { id } = useParams() as { id: string };
// //   const [question, setQuestion] = useState<WritingQuestion | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [saving, setSaving] = useState(false);

// //   useEffect(() => {
// //     if (!id) return;

// //     fetch(`${API_URL}/api/admin/questions/writing/writing-questions/${id}`, {
// //       credentials: "include",
// //     })
// //       .then((r) => r.json())
// //       .then((res) => {
// //         if (res.success && res.data) {
// //           setQuestion(res.data);
// //         }
// //         setLoading(false);
// //       })
// //       .catch((err) => {
// //         console.error("Lỗi load đề:", err);
// //         setLoading(false);
// //       });
// //   }, [id]);

// //   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
// //     e.preventDefault();
// //     if (!question) return;

// //     setSaving(true);
// //     const formData = new FormData(e.currentTarget);

// //     try {
// //       const res = await fetch(
// //         `${API_URL}/api/admin/questions/writing/writing-questions/${id}`,
// //         {
// //           method: "PUT",
// //           credentials: "include",
// //           body: formData,
// //         }
// //       );

// //       if (res.ok) {
// //         alert("ĐÃ LƯU THÀNH CÔNG – BAND 9.0 EDIT!!!");
// //         router.push("/admin/skills/writing/questions");
// //       } else {
// //         const error = await res.json();
// //         alert("Lưu thất bại: " + (error.message || "Lỗi server"));
// //       }
// //     } catch (err) {
// //       alert("Lỗi mạng rồi con ơi!");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
// //         <p className="text-5xl font-black text-blue-600">
// //           Đang tải form edit xịn xò...
// //         </p>
// //       </div>
// //     );
// //   }

// //   if (!question) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
// //         <div className="text-center">
// //           <p className="text-6xl font-black text-red-600 mb-8">
// //             KHÔNG TÌM THẤY ĐỀ!
// //           </p>
// //           <Button size="lg" asChild>
// //             <Link href="/admin/skills/writing/questions">
// //               <ArrowLeft className="mr-3" />
// //               Quay lại danh sách
// //             </Link>
// //           </Button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <main className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
// //       <Navbar />

// //       <div className="mt-20 px-6 max-w-6xl mx-auto py-12">
// //         {/* Header */}
// //         <div className="flex justify-between items-center mb-12">
// //           <Button
// //             variant="ghost"
// //             size="lg"
// //             asChild
// //             className="text-xl hover:scale-105 transition">
// //             <Link href="/admin/skills/writing/questions">
// //               <ArrowLeft className="mr-4 w-8 h-8" />
// //               Quay lại danh sách
// //             </Link>
// //           </Button>

// //           <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
// //             CHỈNH SỬA ĐỀ WRITING
// //           </h1>

// //           <div className="w-32" />
// //         </div>

// //         <form onSubmit={handleSubmit} className="space-y-10">
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
// //             {/* CỘT TRÁI - THÔNG TIN CHUNG */}
// //             <Card className="shadow-3xl border-4 border-purple-300">
// //               <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
// //                 <CardTitle className="text-4xl font-black">
// //                   THÔNG TIN CHUNG
// //                 </CardTitle>
// //               </CardHeader>
// //               <CardContent className="pt-8 space-y-8">
// //                 <div>
// //                   <Label className="text-xl font-bold">Task</Label>
// //                   <Select name="task" defaultValue={question.task} required>
// //                     <SelectTrigger className="text-xl h-14">
// //                       <SelectValue />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       <SelectItem value="Task 1">Task 1</SelectItem>
// //                       <SelectItem value="Task 2">Task 2</SelectItem>
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 <div>
// //                   <Label className="text-xl font-bold">Loại đề</Label>
// //                   <Select name="type" defaultValue={question.type} required>
// //                     <SelectTrigger className="text-xl h-14">
// //                       <SelectValue />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       <SelectItem value="bar_chart">Bar Chart</SelectItem>
// //                       <SelectItem value="line_graph">Line Graph</SelectItem>
// //                       <SelectItem value="pie_chart">Pie Chart</SelectItem>
// //                       <SelectItem value="table">Table</SelectItem>
// //                       <SelectItem value="process">Process</SelectItem>
// //                       <SelectItem value="map">Map</SelectItem>
// //                       <SelectItem value="opinion">Opinion Essay</SelectItem>
// //                       <SelectItem value="discussion">
// //                         Discussion Essay
// //                       </SelectItem>
// //                       <SelectItem value="problem_solution">
// //                         Problem & Solution
// //                       </SelectItem>
// //                       <SelectItem value="advantage_disadvantage">
// //                         Advantages/Disadvantages
// //                       </SelectItem>
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 <div>
// //                   <Label className="text-xl font-bold">Chủ đề (Topic)</Label>
// //                   <Input
// //                     name="topic"
// //                     defaultValue={question.topic}
// //                     required
// //                     className="text-xl h-14"
// //                     placeholder="Nhập chủ đề ngắn gọn..."
// //                   />
// //                 </div>

// //                 <div>
// //                   <Label className="text-xl font-bold">
// //                     Hình ảnh (chỉ Task 1)
// //                   </Label>
// //                   <Input
// //                     type="file"
// //                     name="image"
// //                     accept="image/*"
// //                     className="cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
// //                   />
// //                   {question.image && (
// //                     <div className="mt-4 relative aspect-video rounded-xl overflow-hidden border-4 border-purple-200">
// //                       <img
// //                         src={
// //                           question.image.startsWith("http")
// //                             ? question.image
// //                             : `${API_URL}${question.image}`
// //                         }
// //                         alt="Current"
// //                         className="w-full h-full object-contain"
// //                       />
// //                     </div>
// //                   )}
// //                 </div>
// //               </CardContent>
// //             </Card>

// //             {/* CỘT PHẢI - NỘI DUNG */}
// //             <div className="space-y-10">
// //               <Card className="shadow-3xl border-4 border-cyan-400">
// //                 <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
// //                   <CardTitle className="text-4xl font-black">ĐỀ BÀI</CardTitle>
// //                 </CardHeader>
// //                 <CardContent className="pt-8">
// //                   <Textarea
// //                     name="question"
// //                     defaultValue={question.question}
// //                     required
// //                     className="min-h-64 text-xl leading-relaxed resize-none"
// //                     placeholder="Nhập đề bài đầy đủ ở đây..."
// //                   />
// //                 </CardContent>
// //               </Card>

// //               <Card className="shadow-3xl border-4 border-emerald-400">
// //                 <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
// //                   <CardTitle className="text-4xl font-black">
// //                     SAMPLE ANSWER – BAND 9.0
// //                   </CardTitle>
// //                 </CardHeader>
// //                 <CardContent className="pt-8">
// //                   <Textarea
// //                     name="sampleAnswer"
// //                     defaultValue={question.sampleAnswer || ""}
// //                     className="min-h-96 text-lg font-serif leading-8 resize-none"
// //                     placeholder="Viết bài mẫu band 9.0 ở đây... (tùy chọn)"
// //                   />
// //                 </CardContent>
// //               </Card>

// //               {/* NÚT LƯU */}
// //               <div className="flex justify-end">
// //                 <Button
// //                   type="submit"
// //                   size="lg"
// //                   disabled={saving}
// //                   className="text-3xl px-20 py-10 shadow-2xl hover:scale-105 transition bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
// //                   <Save className="mr-6 w-12 h-12" />
// //                   {saving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
// //                 </Button>
// //               </div>
// //             </div>
// //           </div>
// //         </form>
// //       </div>

// //       <Footer />
// //     </main>
// //   );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import Navbar from "@/components/navbar";
// import Footer from "@/components/footer";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, PenTool } from "lucide-react";
// import Link from "next/link";

// const API_URL = `"http://localhost:3000"}/api/admin/questions/writing`;

// interface WritingQuestion {
//   _id: string;
//   task: "Task 1" | "Task 2";
//   type: string;
//   topic: string;
//   question: string;
//   image?: string;
//   sampleAnswer?: string;
//   difficulty: "easy" | "medium" | "hard";
// }

// export default function WritingQuestionDetail() {
//   const { id } = useParams() as { id: string };
//   const [question, setQuestion] = useState<WritingQuestion | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!id) return;

//     // ĐÃ SỬA HOÀN HẢO: KHÔNG credentials + URL đúng + xử lý lỗi ngon
//     fetch(`${API_URL}/admin/skills/writing/questions/detail/${id}`)
//       .then(async (r) => {
//         if (!r.ok) {
//           const text = await r.text();
//           throw new Error(`HTTP ${r.status}: ${text.substring(0, 200)}`);
//         }
//         return r.json();
//       })
//       .then((res) => {
//         if (res.success && res.data) {
//           setQuestion(res.data);
//         } else {
//           console.error("API không success:", res);
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Lỗi tải đề Writing:", err.message);
//         setLoading(false);
//       });
//   }, [id]);

//   const getTypeLabel = (type: string) => {
//     const map: Record<string, string> = {
//       bar_chart: "Bar Chart",
//       line_graph: "Line Graph",
//       pie_chart: "Pie Chart",
//       table: "Table",
//       process: "Process Diagram",
//       map: "Map",
//       mixed_chart: "Mixed Charts",
//       opinion: "Opinion Essay",
//       discussion: "Discussion Essay",
//       problem_solution: "Problem & Solution",
//       advantage_disadvantage: "Advantages/Disadvantages",
//       two_part_question: "Two-Part Question",
//     };
//     return (
//       map[type] ||
//       type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
//     );
//   };

//   const getDifficultyColor = (diff: string) => {
//     if (diff === "easy") return "bg-green-100 text-green-800 border-green-400";
//     if (diff === "hard") return "bg-red-100 text-red-800 border-red-400";
//     return "bg-yellow-100 text-yellow-800 border-yellow-400";
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
//         <div className="text-center">
//           <PenTool className="w-32 h-32 animate-pulse text-purple-600 mx-auto mb-8" />
//           <p className="text-6xl font-black text-purple-600">ĐANG TẢI ĐỀ...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!question) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
//         <div className="text-center">
//           <p className="text-8xl font-black text-red-600 mb-10">
//             KHÔNG TÌM THẤY ĐỀ!
//           </p>
//           <Button size="lg" asChild className="text-3xl px-16 py-10">
//             <Link href="/admin/skills/writing/questions">
//               <ArrowLeft className="mr-6 w-12 h-12" />
//               Quay lại danh sách
//             </Link>
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
//       <Navbar />
//       <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
//         <Button
//           variant="ghost"
//           size="lg"
//           asChild
//           className="mb-12 text-2xl font-bold hover:scale-105 transition">
//           <Link href="/admin/skills/writing/questions">
//             <ArrowLeft className="mr-4 w-10 h-10" />
//             Quay lại danh sách
//           </Link>
//         </Button>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//           {/* CỘT TRÁI - THÔNG TIN */}
//           <div className="space-y-10">
//             <Card className="shadow-3xl border-4 border-purple-400 overflow-hidden">
//               <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
//                 <CardTitle className="text-5xl font-black flex items-center gap-6">
//                   <PenTool className="w-16 h-16" />
//                   THÔNG TIN ĐỀ
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-10 space-y-10">
//                 <div>
//                   <p className="text-2xl font-bold text-purple-700">Task</p>
//                   <Badge className="text-3xl px-12 py-6 mt-4 font-bold">
//                     {question.task}
//                   </Badge>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-purple-700">Loại đề</p>
//                   <Badge
//                     variant="outline"
//                     className="text-2xl px-10 py-5 mt-4 border-4 border-purple-500">
//                     {getTypeLabel(question.type)}
//                   </Badge>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-purple-700">Độ khó</p>
//                   <Badge
//                     className={`text-3xl px-14 py-7 mt-5 border-4 font-black ${getDifficultyColor(question.difficulty)}`}>
//                     {question.difficulty.toUpperCase()}
//                   </Badge>
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-purple-700">Chủ đề</p>
//                   <p className="text-4xl font-black text-purple-800 mt-4 leading-tight">
//                     {question.topic}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {question.image && (
//               <Card className="shadow-3xl overflow-hidden border-4 border-cyan-400">
//                 <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
//                   <CardTitle className="text-4xl font-black">
//                     HÌNH ẢNH TASK 1
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-0">
//                   <img
//                     src={
//                       question.image.startsWith("http")
//                         ? question.image
//                         : `${API_URL}${question.image}`
//                     }
//                     alt="Task 1 Chart"
//                     className="w-full h-auto max-h-screen object-contain bg-gray-50"
//                   />
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           {/* CỘT PHẢI - NỘI DUNG */}
//           <div className="lg:col-span-2 space-y-12">
//             <Card className="shadow-3xl border-4 border-purple-500">
//               <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
//                 <CardTitle className="text-6xl font-black">ĐỀ BÀI</CardTitle>
//               </CardHeader>
//               <CardContent className="pt-12">
//                 <p className="text-3xl leading-relaxed font-medium text-gray-800 whitespace-pre-wrap">
//                   {question.question}
//                 </p>
//               </CardContent>
//             </Card>

//             {question.sampleAnswer && (
//               <Card className="shadow-3xl border-4 border-emerald-500">
//                 <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
//                   <CardTitle className="text-6xl font-black">
//                     SAMPLE ANSWER – BAND 9.0
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="pt-12">
//                   <p className="text-xl leading-9 font-serif text-gray-700 whitespace-pre-wrap tracking-wide">
//                     {question.sampleAnswer}
//                   </p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </main>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  PenTool,
  Image as ImageIcon,
  FileText,
  Edit,
} from "lucide-react";
import Link from "next/link";

// ĐÚNG THEO 2 TRANG DANH SÁCH + NEW CỦA CON – DÙNG PORT 3000, KHÔNG DÙNG ENV!!!
const API_URL = "http://localhost:3000";

interface WritingQuestion {
  _id: string;
  task: "Task 1" | "Task 2";
  type: string;
  topic: string;
  question: string;
  image?: string;
  sampleAnswer?: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function WritingQuestionDetail() {
  const { id } = useParams() as { id: string };
  const [question, setQuestion] = useState<WritingQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // ĐÃ SỬA ĐÚNG 100% – DÙNG ROUTE /api/admin/writing/${id} + PORT 3000 + KHÔNG CREDENTIALS!!!
    fetch(`${API_URL}/api/admin/questions/writing/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Lỗi ${r.status}: ${text.substring(0, 100)}`);
        }
        return r.json();
      })
      .then((res) => {
        console.log("Detail API trả về:", res);
        if (res.success && res.data) {
          setQuestion(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải chi tiết Writing:", err);
        alert("Không load được đề! Backend có chạy port 3000 không con?");
        setLoading(false);
      });
  }, [id]);

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      bar_chart: "Bar Chart",
      line_graph: "Line Graph",
      pie_chart: "Pie Chart",
      table: "Table",
      process: "Process",
      map: "Map",
      mixed_chart: "Mixed Chart",
      opinion: "Opinion Essay",
      discussion: "Discussion Essay",
      problem_solution: "Problem & Solution",
      cause_effect: "Cause & Effect",
      advantage_disadvantage: "Advantages/Disadvantages",
      two_part_question: "Two-Part Question",
    };
    return map[type] || type.replace(/_/g, " ").toUpperCase();
  };

  const getTaskColor = (task: string) =>
    task === "Task 1"
      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
      : "bg-gradient-to-r from-purple-500 to-pink-600 text-white";

  const getDifficultyColor = (diff: string) => {
    if (diff === "easy") return "bg-green-500 text-white";
    if (diff === "hard") return "bg-red-500 text-white";
    return "bg-yellow-500 text-white";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <PenTool className="w-32 h-32 animate-pulse text-blue-600 mx-auto mb-8" />
          <p className="text-6xl font-black text-blue-600">ĐANG TẢI ĐỀ...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <p className="text-8xl font-black text-red-600 mb-12">
            KHÔNG TÌM THẤY ĐỀ!
          </p>
          <Button size="lg" asChild className="text-3xl px-16 py-10">
            <Link href="/admin/skills/writing/questions">
              <ArrowLeft className="mr-6 w-12 h-12" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        {/* NÚT QUAY LẠI + TIÊU ĐỀ */}
        <div className="flex justify-between items-center mb-12">
          <Button
            variant="ghost"
            size="lg"
            asChild
            className="text-2xl font-bold hover:scale-105 transition">
            <Link href="/admin/skills/writing/questions">
              <ArrowLeft className="mr-4 w-10 h-10" />
              Quay lại danh sách
            </Link>
          </Button>

          <h1 className="text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            CHI TIẾT ĐỀ WRITING
          </h1>

          <Button
            asChild
            size="lg"
            className="text-2xl px-12 py-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
            <Link href={`/admin/skills/writing/questions/edit/${question._id}`}>
              <Edit className="mr-4 w-8 h-8" />
              CHỈNH SỬA
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* CỘT TRÁI - THÔNG TIN CHUNG */}
          <div className="space-y-10">
            <Card className="shadow-3xl border-4 border-purple-400 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="text-5xl font-black flex items-center gap-6">
                  <PenTool className="w-16 h-16" />
                  THÔNG TIN ĐỀ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-10 space-y-10">
                <div>
                  <p className="text-2xl font-bold text-purple-700">Task</p>
                  <Badge
                    className={`text-3xl px-12 py-6 mt-4 font-bold shadow-lg ${getTaskColor(question.task)}`}>
                    {question.task}
                  </Badge>
                </div>

                <div>
                  <p className="text-2xl font-bold text-purple-700">Loại đề</p>
                  <Badge
                    variant="outline"
                    className="text-2xl px-10 py-5 mt-4 border-4 border-purple-500">
                    {getTypeLabel(question.type)}
                  </Badge>
                </div>

                <div>
                  <p className="text-2xl font-bold text-purple-700">Độ khó</p>
                  <Badge
                    className={`text-3xl px-14 py-7 mt-5 border-4 font-black ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-2xl font-bold text-purple-700">Chủ đề</p>
                  <p className="text-4xl font-black text-purple-800 mt-4 leading-tight">
                    {question.topic}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* HÌNH ẢNH TASK 1 */}
            {question.image && (
              <Card className="shadow-3xl overflow-hidden border-4 border-cyan-400">
                <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                  <CardTitle className="text-4xl font-black flex items-center gap-4">
                    <ImageIcon className="w-12 h-12" />
                    HÌNH ẢNH TASK 1
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={
                      question.image.startsWith("http")
                        ? question.image
                        : `${API_URL}${question.image}`
                    }
                    alt="Task 1 Chart"
                    className="w-full h-auto max-h-screen object-contain bg-gray-50"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* CỘT PHẢI - NỘI DUNG */}
          <div className="lg:col-span-2 space-y-12">
            {/* ĐỀ BÀI */}
            <Card className="shadow-3xl border-4 border-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white">
                <CardTitle className="text-6xl font-black flex items-center gap-6">
                  <FileText className="w-16 h-16" />
                  ĐỀ BÀI
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-12">
                <p className="text-3xl leading-relaxed font-medium text-gray-800 whitespace-pre-wrap">
                  {question.question}
                </p>
              </CardContent>
            </Card>

            {/* SAMPLE ANSWER */}
            {question.sampleAnswer && (
              <Card className="shadow-3xl border-4 border-emerald-500">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                  <CardTitle className="text-6xl font-black">
                    SAMPLE ANSWER – BAND 9.0
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-12">
                  <p className="text-xl leading-9 font-serif text-gray-700 whitespace-pre-wrap tracking-wide">
                    {question.sampleAnswer}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
