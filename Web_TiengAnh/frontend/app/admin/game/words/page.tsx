// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Plus, Edit, Trash2, Search } from "lucide-react";

// interface Category {
//   _id: string;
//   name: string;
// }

// interface Word {
//   _id: string;
//   word: string;
//   category: Category;
//   hint: string;
//   meaning: string;
//   usage: string;
//   example: string;
//   createdAt: string;
// }

// export default function AdminWordsPage() {
//   const [words, setWords] = useState<Word[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [filteredCategory, setFilteredCategory] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [formData, setFormData] = useState({
//     word: "",
//     category: "",
//     hint: "",
//     meaning: "",
//     usage: "",
//     example: ""
//   });
//   const [editingWord, setEditingWord] = useState<Word | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     fetchWords();
//     fetchCategories();
//   }, []);

//   const fetchWords = async () => {
//     try {
//       const response = await fetch("http://localhost:3000/api/admin/game/words"); // SỬA: Full URL backend
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       setWords(data.data || data || []);
//     } catch (error) {
//       console.error("Error fetching words:", error);
//       setWords([]);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await fetch("http://localhost:3000/api/admin/game/categories"); // SỬA: Full URL backend
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       setCategories(data.data || data || []);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.word.trim() || !formData.category) {
//       alert("Vui lòng điền đầy đủ từ vựng và category!");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const url = editingWord 
//         ? `/api/admin/game/words/${editingWord._id}`
//         : "/api/admin/game/words";
      
//       const method = editingWord ? "PUT" : "POST";
      
//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         const result = await response.json();
//         alert(result.message || "Lỗi khi lưu");
//         return;
//       }

//       setFormData({ word: "", category: "", hint: "", meaning: "", usage: "", example: "" });
//       setEditingWord(null);
//       fetchWords();
//       alert(editingWord ? "Cập nhật thành công!" : "Tạo từ thành công!");
//     } catch (error) {
//       alert("Lỗi kết nối server");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEdit = (word: Word) => {
//     setEditingWord(word);
//     setFormData({
//       word: word.word,
//       category: word.category._id,
//       hint: word.hint,
//       meaning: word.meaning,
//       usage: word.usage,
//       example: word.example
//     });
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Bạn có chắc muốn xóa từ này?")) return;
//     try {
//       const response = await fetch(`/api/admin/game/words/${id}`, { method: "DELETE" });
//       if (!response.ok) {
//         const result = await response.json();
//         alert(result.message || "Lỗi khi xóa");
//         return;
//       }
//       fetchWords();
//       alert("Xóa thành công!");
//     } catch (error) {
//       alert("Lỗi kết nối server");
//     }
//   };

//   const filteredWords = words.filter(word => {
//     const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = !filteredCategory || word.category._id === filteredCategory;
//     return matchesSearch && matchesCategory;
//   });

//   if (!mounted) return null;

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Quản lý Từ vựng</h1>
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         <Card className="lg:col-span-1">
//           <CardHeader>
//             <CardTitle>{editingWord ? "Chỉnh sửa Từ" : "Tạo Từ Mới"}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <Label htmlFor="word">Từ vựng *</Label>
//                 <Input
//                   id="word"
//                   value={formData.word}
//                   onChange={(e) => setFormData({ ...formData, word: e.target.value })}
//                   placeholder="Ví dụ: rain, computer..."
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="category">Category *</Label>
//                 <Select 
//                   value={formData.category} 
//                   onValueChange={(value) => setFormData({ ...formData, category: value })}
//                   disabled={isLoading}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Chọn category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.length > 0 ? (
//                       categories.map((category) => (
//                         <SelectItem key={category._id} value={category._id}>
//                           {category.name}
//                         </SelectItem>
//                       ))
//                     ) : (
//                       <SelectItem value="no-category" disabled>
//                         Không có category
//                       </SelectItem>
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="hint">Gợi ý *</Label>
//                 <Input
//                   id="hint"
//                   value={formData.hint}
//                   onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
//                   placeholder="Ví dụ: Nước rơi từ trời..."
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="meaning">Nghĩa *</Label>
//                 <Textarea
//                   id="meaning"
//                   value={formData.meaning}
//                   onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
//                   placeholder="Nghĩa tiếng Việt..."
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="usage">Cách dùng *</Label>
//                 <Textarea
//                   id="usage"
//                   value={formData.usage}
//                   onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
//                   placeholder="Cách sử dụng trong câu..."
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="example">Ví dụ *</Label>
//                 <Textarea
//                   id="example"
//                   value={formData.example}
//                   onChange={(e) => setFormData({ ...formData, example: e.target.value })}
//                   placeholder="Ví dụ câu hoàn chỉnh..."
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 <Plus className="w-4 h-4 mr-2" />
//                 {editingWord ? "Cập nhật" : "Tạo mới"}
//               </Button>
//               {editingWord && (
//                 <Button 
//                   type="button" 
//                   variant="outline" 
//                   className="w-full"
//                   onClick={() => {
//                     setEditingWord(null);
//                     setFormData({ word: "", category: "", hint: "", meaning: "", usage: "", example: "" });
//                   }}
//                   disabled={isLoading}
//                 >
//                   Hủy
//                 </Button>
//               )}
//             </form>
//           </CardContent>
//         </Card>

//         <Card className="lg:col-span-3">
//           <CardHeader>
//             <CardTitle className="flex justify-between items-center">
//               <span>Danh sách Từ vựng ({filteredWords.length})</span>
//               <div className="flex space-x-4">
//                 <div className="flex items-center space-x-2">
//                   <Search className="w-4 h-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Tìm kiếm từ..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-48"
//                   />
//                 </div>
//                 <Select value={filteredCategory} onValueChange={(value) => setFilteredCategory(value === "all" ? "" : value)}>
//                   <SelectTrigger className="w-48">
//                     <SelectValue placeholder="Lọc theo category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">Tất cả categories</SelectItem>
//                     {categories.map((category) => (
//                       <SelectItem key={category._id} value={category._id}>
//                         {category.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {filteredWords.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 Không có từ nào phù hợp.
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Từ</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead>Gợi ý</TableHead>
//                     <TableHead>Thao tác</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredWords.map((word) => (
//                     <TableRow key={word._id}>
//                       <TableCell className="font-medium">{word.word}</TableCell>
//                       <TableCell>{word.category.name}</TableCell>
//                       <TableCell>{word.hint}</TableCell>
//                       <TableCell>
//                         <div className="flex space-x-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleEdit(word)}
//                             disabled={isLoading}
//                           >
//                             <Edit className="w-4 h-4" />
//                           </Button>
//                           <Button
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => handleDelete(word._id)}
//                             disabled={isLoading}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select"; // ĐÃ TẠO

interface Category {
  _id: string;
  name: string;
}

interface Word {
  _id: string;
  word: string;
  category: Category[];
  hint: string;
  meaning: string;
  usage: string;
  example: string;
  createdAt: string;
}

export default function AdminWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategory, setFilteredCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    word: "",
    category: [] as string[],
    hint: "",
    meaning: "",
    usage: "",
    example: "",
  });
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchWords();
    fetchCategories();
  }, []);

  const fetchWords = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/game/words");
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Lỗi khi tải từ vựng");
        return;
      }
      const data = await response.json();
      setWords(data.data || data || []);
    } catch (error) {
      alert("Lỗi kết nối server");
      setWords([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/game/categories");
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Lỗi khi tải categories");
        return;
      }
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      alert("Lỗi khi tải categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word.trim()) {
      alert("Từ vựng là bắt buộc!");
      return;
    }
    if (formData.category.length === 0) {
      alert("Vui lòng chọn ít nhất 1 category!");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingWord
        ? `http://localhost:3000/api/admin/game/words/${editingWord._id}`
        : "http://localhost:3000/api/admin/game/words";

      const method = editingWord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({ word: "", category: [], hint: "", meaning: "", usage: "", example: "" });
        setEditingWord(null);
        fetchWords();
        alert(editingWord ? "Cập nhật thành công!" : "Tạo từ thành công!");
      } else {
        alert(result.message || "Lỗi khi lưu");
      }
    } catch (error) {
      alert("Lỗi kết nối server. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (word: Word) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      category: word.category.map((c) => c._id),
      hint: word.hint,
      meaning: word.meaning,
      usage: word.usage,
      example: word.example,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa từ này?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/admin/game/words/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        alert(result.message || "Lỗi khi xóa");
        return;
      }
      fetchWords();
      alert("Xóa thành công!");
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  // Lọc từ theo tìm kiếm và category
  const filteredWords = words.filter((word) => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !filteredCategory || word.category.some((c) => c._id === filteredCategory);
    return matchesSearch && matchesCategory;
  });

  // Tạo options cho MultiSelect
  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c._id,
  }));

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quản lý Từ vựng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* FORM TẠO / SỬA */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{editingWord ? "Chỉnh sửa Từ" : "Tạo Từ Mới"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="word">Từ vựng *</Label>
                <Input
                  id="word"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  placeholder="Ví dụ: rain, computer..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <MultiSelect
                  options={categoryOptions}
                  selected={formData.category}
                  onChange={(selected) => setFormData({ ...formData, category: selected })}
                  placeholder="Chọn 1 hoặc nhiều..."
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="hint">Gợi ý *</Label>
                <Input
                  id="hint"
                  value={formData.hint}
                  onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                  placeholder="Ví dụ: Nước rơi từ trời..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="meaning">Nghĩa *</Label>
                <Textarea
                  id="meaning"
                  value={formData.meaning}
                  onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                  placeholder="Nghĩa tiếng Việt..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="usage">Cách dùng *</Label>
                <Textarea
                  id="usage"
                  value={formData.usage}
                  onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                  placeholder="Cách sử dụng trong câu..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="example">Ví dụ *</Label>
                <Textarea
                  id="example"
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  placeholder="Ví dụ câu hoàn chỉnh..."
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                {editingWord ? "Cập nhật" : "Tạo mới"}
              </Button>

              {editingWord && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingWord(null);
                    setFormData({ word: "", category: [], hint: "", meaning: "", usage: "", example: "" });
                  }}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* DANH SÁCH TỪ VỰNG */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Danh sách Từ vựng ({filteredWords.length})</span>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm từ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                </div>
                <select
                  value={filteredCategory}
                  onChange={(e) => setFilteredCategory(e.target.value)}
                  className="border rounded p-2 text-sm"
                >
                  <option value="">Tất cả categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredWords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có từ nào phù hợp.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Từ</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Gợi ý</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWords.map((word) => (
                    <TableRow key={word._id}>
                      <TableCell className="font-medium">{word.word}</TableCell>
                      <TableCell>{word.category.map((c) => c.name).join(", ")}</TableCell>
                      <TableCell>{word.hint}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(word)}
                            disabled={isLoading}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(word._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}