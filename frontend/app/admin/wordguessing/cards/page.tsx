"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, PenSquare, Trash2, Plus, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface WordTopic {
  _id: string;
  name: string;
}

interface WordCard {
  _id: string;
  topic: WordTopic;
  keyword: string;
  hintSentence: string;
  sentenceWithBlank: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

interface FormData {
  topic: string;
  keyword: string;
  hintSentence: string;
  sentenceWithBlank: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function AdminWordCardsPage() {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [topics, setTopics] = useState<WordTopic[]>([]);
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    keyword: "",
    hintSentence: "",
    sentenceWithBlank: "",
    difficulty: "medium",
  });
  const [editingCard, setEditingCard] = useState<WordCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterTopic, setFilterTopic] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCards();
    fetchTopics();
  }, []);

  const fetchCards = async () => {
    try {
      const data = await apiFetch<any>("/admin/wordguessing/cards");
      setCards(data.data || []);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const data = await apiFetch<any>("/admin/wordguessing/topics");
      setTopics(data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.topic ||
      !formData.keyword ||
      !formData.hintSentence ||
      !formData.sentenceWithBlank
    ) {
      alert("Please fill all required fields!");
      return;
    }

    setIsLoading(true);
    try {
      const url = editingCard
        ? `/admin/wordguessing/cards/${editingCard._id}`
        : "/admin/wordguessing/cards";

      const method = editingCard ? "PUT" : "POST";

      await apiFetch<any>(url, {
        method,
        body: JSON.stringify(formData),
      });

      setFormData({
        topic: "",
        keyword: "",
        hintSentence: "",
        sentenceWithBlank: "",
        difficulty: "medium",
      });
      setEditingCard(null);
      await fetchCards();
      await fetchTopics(); // Update topic counts if changed (backend logic might handle this but client refresh is safer)
      alert(editingCard ? "Updated successfully!" : "Created successfully!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (card: WordCard) => {
    setEditingCard(card);
    setFormData({
      topic: card.topic._id,
      keyword: card.keyword,
      hintSentence: card.hintSentence,
      sentenceWithBlank: card.sentenceWithBlank,
      difficulty: card.difficulty,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    setIsLoading(true);
    try {
      await apiFetch(`/admin/wordguessing/cards/${id}`, {
        method: "DELETE",
      });

      await fetchCards();
      await fetchTopics();
      alert("Deleted successfully!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCards = filterTopic
    ? cards.filter((c) => c.topic._id === filterTopic)
    : cards;

  if(!mounted) return null;

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
         <Gamepad2 className="w-8 h-8 text-amber-500" />
         <h1 className="text-3xl font-bold text-slate-800">WordGuessing Cards</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
         <div className="lg:col-span-1">
             <Card className="border-slate-200 shadow-sm h-fit sticky top-8">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg">
                    {editingCard ? "Edit Card" : "Create Card"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                     <div>
                        <Label>Topic *</Label>
                        <Select
                            value={formData.topic}
                            onValueChange={(v) =>
                              setFormData({ ...formData, topic: v })
                            }
                            disabled={isLoading}
                        >
                            <SelectTrigger className="bg-white mt-1.5"><SelectValue placeholder="Select topic"/></SelectTrigger>
                            <SelectContent>
                                {topics.map((t) => (
                                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>

                     <div>
                        <Label>Keyword *</Label>
                        <Input
                            value={formData.keyword}
                            onChange={(e) =>
                              setFormData({ ...formData, keyword: e.target.value })
                            }
                            placeholder="e.g. beautiful"
                            disabled={isLoading}
                            className="bg-white mt-1.5"
                        />
                     </div>
                     
                     <div>
                         <Label>Difficulty</Label>
                         <Select
                            value={formData.difficulty}
                            onValueChange={(v: "easy" | "medium" | "hard") =>
                                setFormData({ ...formData, difficulty: v })
                            }
                            disabled={isLoading}
                        >
                            <SelectTrigger className="bg-white mt-1.5"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                     <div>
                        <Label>Hint Sentence *</Label>
                        <Textarea
                            value={formData.hintSentence}
                            onChange={(e) =>
                              setFormData({ ...formData, hintSentence: e.target.value })
                            }
                            rows={2}
                            placeholder="e.g. Pleasing to the eye..."
                            disabled={isLoading}
                            className="bg-white mt-1.5 resize-none"
                        />
                     </div>

                     <div>
                        <Label>Sentence with Blank (___) *</Label>
                        <Textarea
                            value={formData.sentenceWithBlank}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                sentenceWithBlank: e.target.value,
                              })
                            }
                            rows={2}
                            placeholder="e.g. The sunset is ___."
                            disabled={isLoading}
                            className="bg-white mt-1.5 resize-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Use 3 underscores (___) for the blank.</p>
                     </div>

                      <div className="pt-2">
                            <Button onClick={handleSubmit} className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Plus className="w-4 h-4 mr-2"/> }
                                {editingCard ? "Update Card" : "Create Card"}
                            </Button>
                            
                            {editingCard && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => {
                                        setEditingCard(null);
                                        setFormData({
                                            topic: "",
                                            keyword: "",
                                            hintSentence: "",
                                            sentenceWithBlank: "",
                                            difficulty: "medium",
                                        });
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            )}
                      </div>
                </CardContent>
             </Card>
         </div>

        {/* LIST */}
        <div className="lg:col-span-2">
            <Card className="border-slate-200 shadow-sm">
                 <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle>Card List ({filteredCards.length})</CardTitle>
                         <select
                            value={filterTopic}
                            onChange={(e) => setFilterTopic(e.target.value)}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950 min-w-[200px]">
                            <option value="">All Topics</option>
                            {topics.map((t) => (
                                <option key={t._id} value={t._id}>
                                {t.name}
                                </option>
                            ))}
                        </select>
                     </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    {filteredCards.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Gamepad2 className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium">No cards found</h3>
                            <p className="text-slate-500 text-sm mt-1">Select a topic or create a new card.</p>
                        </div>
                    ) : (
                         <div className="divide-y divide-slate-100">
                             {filteredCards.map((card) => (
                                 <div key={card._id} className="p-5 hover:bg-slate-50 transition-colors group">
                                     <div className="flex justify-between items-start mb-3">
                                         <div className="flex items-center gap-2">
                                             <Badge variant="outline" className="bg-slate-50 font-normal text-slate-600 border-slate-200">{card.topic.name}</Badge>
                                             <Badge variant="outline" className={`font-normal capitalize ${
                                                  card.difficulty === "easy"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : card.difficulty === "medium"
                                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                      : "bg-red-50 text-red-700 border-red-200"
                                                }`}>
                                                {card.difficulty}
                                             </Badge>
                                         </div>
                                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-600" onClick={() => handleEdit(card)}>
                                                <PenSquare className="w-4 h-4" />
                                             </Button>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(card._id)}>
                                                <Trash2 className="w-4 h-4" />
                                             </Button>
                                         </div>
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                         <div className="md:col-span-1">
                                            <div className="text-lg font-bold text-amber-600 mb-1">{card.keyword}</div>
                                            <div className="text-xs text-slate-400">Keyword</div>
                                         </div>
                                         <div className="md:col-span-2 space-y-2">
                                            <div>
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hint</span>
                                                <p className="text-sm text-slate-700 italic">{card.hintSentence}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Blank Sentence</span>
                                                <p className="text-sm text-slate-800 font-medium bg-slate-100/50 p-2 rounded border border-slate-100">{card.sentenceWithBlank}</p>
                                            </div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    )}
                 </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
