"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Shield, MoreVertical, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { PaginationControl } from "@/components/PaginationControl";


interface User {
  _id: string;
  username: string;
  email: string;
  role: string | { name: string };
  createdAt: string;
  name?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Custom debounce logic
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { toast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
        if (searchTerm !== debouncedSearch) {
             setDebouncedSearch(searchTerm);
             setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, debouncedSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Construct query
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch,
      });

      const res = await apiFetch(`/admin/users?${queryParams.toString()}`);
      
      if (res && res.data) {
        setUsers(res.data);
        if (res.pagination) {
            setPagination(res.pagination);
        }
      } else if (Array.isArray(res)) {
         // Fallback for old API if something goes wrong or mixed versions
         setUsers(res);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
      if (res.success || res.message?.includes("deleted") || res.status === 200) {
        toast({ title: "User deleted successfully" });
        fetchUsers();
      } else {
        toast({ variant: "destructive", title: "Failed", description: res.message || "Could not delete user" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user" });
    }
  };

  const getRoleName = (role: any) => {
      if (typeof role === 'string') return role;
      if (typeof role === 'object' && role?.name) return role.name;
      return "user";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system users, roles, and permissions.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <CardContent className="p-6">
          {/* TOOLBAR */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 text-sm text-slate-500">
                <span>Total: <span className="font-bold text-slate-700 dark:text-slate-300">{pagination.total}</span></span>
            </div>
          </div>

          {/* TABLE */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 pl-6">User Info</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Role</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Joined Date</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                             <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                             Loading users...
                        </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                             <Search className="w-8 h-8 opacity-20" />
                             No users found matching "{debouncedSearch}".
                        </div>
                     </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {user.username?.substring(0,2).toUpperCase() || "U"}
                             </div>
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
                                    {user.name || user.username}
                                </span>
                                <span className="text-xs text-slate-500">{user.email}</span>
                             </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                            const roleName = getRoleName(user.role);
                            return (
                                <Badge variant="secondary" className={`
                                    capitalize font-medium border
                                    ${roleName === 'admin' 
                                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900'
                                    }
                                `}>
                                    {roleName === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                                    {roleName}
                                </Badge>
                            )
                        })()}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer">
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/10"
                                onClick={() => handleDelete(user._id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControl 
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
