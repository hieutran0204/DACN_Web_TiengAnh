"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function NewWritingQuestion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${API_URL}/api/admin/questions/writing/`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Tạo thất bại");

      alert("TẠO ĐỀ WRITING THÀNH CÔNG – BAND 9.0 ĐỈNH CAO!!!");
      router.push("/admin/writing/questions");
    } catch (err) {
      alert("Lỗi: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Navbar />
      <div className="mt-20 px-6 max-w-7xl mx-auto py-12">
        <h1 className="text-7xl font-black text-center mb-16 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          TẠO MỚI WRITING QUESTION
        </h1>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-8">
              <Card className="shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-teal-100 to-blue-100">
                  <CardTitle className="text-3xl font-black">
                    THÔNG TIN
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <select
                    name="task"
                    required
                    className="w-full p-5 border-2 rounded-xl text-xl bg-white">
                    <option value="Task 1">Task 1</option>
                    <option value="Task 2">Task 2</option>
                  </select>

                  <select
                    name="type"
                    required
                    className="w-full p-5 border-2 rounded-xl text-xl bg-white">
                    <optgroup label="Task 1">
                      <option value="bar_chart">Bar Chart</option>
                      <option value="line_graph">Line Graph</option>
                      <option value="pie_chart">Pie Chart</option>
                      <option value="table">Table</option>
                      <option value="process">Process</option>
                      <option value="map">Map</option>
                      <option value="mixed_chart">Mixed Chart</option>
                    </optgroup>
                    <optgroup label="Task 2">
                      <option value="opinion">Opinion</option>
                      <option value="discussion">Discussion</option>
                      <option value="problem_solution">
                        Problem & Solution
                      </option>
                      <option value="cause_effect">Causes & Effects</option>
                      <option value="advantage_disadvantage">Adv/Disadv</option>
                      <option value="two_part_question">
                        Two-part Question
                      </option>
                    </optgroup>
                  </select>

                  <Input
                    name="topic"
                    required
                    placeholder="Topic..."
                    className="text-xl h-14"
                  />
                  <Input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="file:py-8 file:px-12 file:rounded-xl file:bg-blue-600 file:text-white"
                  />
                  <Input
                    name="difficulty"
                    placeholder="medium"
                    className="text-xl h-14"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-10">
              <Card className="shadow-2xl border-4 border-blue-400">
                <CardHeader className="bg-gradient-to-r from-teal-100 to-blue-100">
                  <CardTitle className="text-5xl font-black">ĐỀ BÀI</CardTitle>
                </CardHeader>
                <CardContent className="pt-10">
                  <Textarea
                    name="question"
                    required
                    rows={12}
                    className="text-2xl resize-none"
                    placeholder="Nhập đề bài..."
                  />
                </CardContent>
              </Card>

              <Card className="shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-100">
                  <CardTitle className="text-5xl font-black text-indigo-800">
                    SAMPLE ANSWER
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <Textarea
                    name="sampleAnswer"
                    rows={24}
                    className="text-xl font-serif"
                    placeholder="Nhập bài mẫu Band 9..."
                  />
                </CardContent>
              </Card>

              <div className="text-center pt-10">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="text-6xl px-64 py-20 font-black bg-gradient-to-r from-blue-600 to-teal-600">
                  {loading ? "ĐANG TẠO..." : "TẠO NGAY"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
