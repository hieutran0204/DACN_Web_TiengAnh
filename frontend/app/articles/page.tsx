"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface News {
  _id: string;
  title: string;
  image: string;
  createdAt: string;
}

export default function NewsListPage() {
  const [allNews, setAllNews] = useState<News[]>([]);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const itemsPerPage = 6;
  const router = useRouter();

  // Fetch all news once
  useEffect(() => {
    fetchNews();
  }, []);

  // Filter and Paginate whenever page, searchTerm, or allNews changes
  useEffect(() => {
    // 1. Filter by search term
    let filtered = allNews;
    if (searchTerm.trim()) {
      filtered = allNews.filter((news) =>
        news.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Calculate total pages
    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(Math.max(1, total));

    // 3. Update current page if out of bounds
    if (page > total && total > 0) {
      setPage(1);
    }

    // 4. Slice for current page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    setNewsList(paginated);
  }, [page, searchTerm, allNews]);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/user/news`);
      const data = await response.json();
      const fetchedNews = data.data || [];
      setAllNews(fetchedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsClick = (id: string) => {
    router.push(`/articles/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-20">
      {/* Background Elements (copied from Games page) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section (styled like Games page) */}
          <div className="text-center mb-20">
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
                <Newspaper className="w-4 h-4" />
                <span>Knowledge Hub</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 tracking-tight">
                English{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  News
                </span>
              </h1>
              
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto mb-16 relative"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                className="pl-10 h-12 rounded-full border-gray-200 shadow-sm focus-visible:ring-blue-500 bg-white/80 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </motion.div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading articles...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No articles found matching your search." : "No articles available."}
              </p>
            </div>
          ) : (
            <>
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.5, delay: 0.3 }}
                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {newsList.map((news, index) => (
                  <motion.div
                    key={news._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    onClick={() => handleNewsClick(news._id)}
                    className="group bg-card hover:bg-card/80 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden transform hover:-translate-y-1 border border-border/50"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={news.image.startsWith("http") ? news.image : `http://localhost:3000${news.image}`}
                        alt={news.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <div className="flex items-center text-xs font-medium text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">News</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(news.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePageChange(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="gap-1 pl-2.5 hover:bg-primary/10"
                        >
                        <PaginationPrevious className="border-none hover:bg-transparent px-0"/>
                        </Button>
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                         if (
                           p === 1 ||
                           p === totalPages ||
                           (p >= page - 1 && p <= page + 1)
                         ) {
                           return (
                             <PaginationItem key={p}>
                               <PaginationLink
                                 isActive={page === p}
                                 onClick={() => handlePageChange(p)}
                                 className={`cursor-pointer ${page === p ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary/10"}`}
                               >
                                 {p}
                               </PaginationLink>
                             </PaginationItem>
                           );
                         }
                         if (
                           (p === page - 2 && page > 3) ||
                           (p === page + 2 && page < totalPages - 2)
                         ) {
                           return (
                             <PaginationItem key={p}>
                               <span className="px-4 py-2">...</span>
                             </PaginationItem>
                           );
                         }
                         return null;
                      })}

                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="gap-1 pr-2.5 hover:bg-primary/10"
                        >
                          <PaginationNext className="border-none hover:bg-transparent px-0" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}