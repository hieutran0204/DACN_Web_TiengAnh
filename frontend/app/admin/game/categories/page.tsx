"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Loader2, Shapes } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiFetch<any>("/admin/game/categories");
      setCategories(response.data || response || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Tên category là bắt buộc!");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingCategory
        ? `/admin/game/categories/${editingCategory._id}`
        : "/admin/game/categories";

      const method = editingCategory ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      setFormData({ name: "", description: "" });
      setEditingCategory(null);
      fetchCategories();
      alert(
        editingCategory ? "Cập nhật thành công!" : "Tạo category thành công!"
      );
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa category này?")) return;

    try {
      await apiFetch(`/admin/game/categories/${id}`, {
        method: "DELETE",
      });

      fetchCategories();
      alert("Xóa thành công!");
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
         <Shapes className="w-8 h-8 text-indigo-600" />
         <h1 className="text-3xl font-bold text-slate-800">Game Categories</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-slate-200 shadow-sm h-fit sticky top-8">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle>
              {editingCategory ? "Edit Category" : "New Category"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Animals, Tech..."
                  required
                  disabled={isLoading}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Short description..."
                  rows={3}
                  disabled={isLoading}
                  className="bg-white"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
              {editingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingCategory(null);
                    setFormData({ name: "", description: "" });
                  }}
                  disabled={isLoading}>
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle>Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categories.length === 0 ? (
               <div className="text-center py-20">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Shapes className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium">No categories yet</h3>
                <p className="text-slate-500 text-sm mt-1">Create one to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50/50">
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[150px]">Created</TableHead>
                    <TableHead className="text-right pr-6 w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id} className="hover:bg-slate-50">
                      <TableCell className="pl-6 font-medium text-indigo-700">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-slate-600">{category.description || "-"}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                            onClick={() => handleEdit(category)}
                            disabled={isLoading}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => handleDelete(category._id)}
                            disabled={isLoading}>
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
