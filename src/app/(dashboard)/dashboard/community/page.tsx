"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle, ThumbsUp, Eye, Pin, Lock, Search,
  PlusCircle, Loader2, ChevronRight, Hash, Send, X,
} from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  postCount: number;
}

interface PostPreview {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  upvotes: number;
  viewCount: number;
  replyCount: number;
  author: { id: string; name: string | null; image: string | null; role: string };
  category: { name: string; slug: string; icon: string | null };
  createdAt: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", categoryId: "" });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/community/categories")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); });
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, sort]);

  const fetchPosts = (searchQuery?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (searchQuery || search) params.set("search", searchQuery || search);
    params.set("sort", sort);

    fetch(`/api/community/posts?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.posts) setPosts(data.posts);
      })
      .finally(() => setLoading(false));
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.categoryId) return;
    setPosting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        setShowNewPost(false);
        setNewPost({ title: "", content: "", categoryId: "" });
        fetchPosts();
      }
    } catch {
      // silent
    } finally {
      setPosting(false);
    }
  };

  const handleVote = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/vote`, { method: "POST" });
      const data = await res.json();
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, upvotes: data.voted ? p.upvotes + 1 : p.upvotes - 1 }
            : p
        )
      );
    } catch {
      // silent
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Connect, share, and learn with fellow founders, mentors, and investors
          </p>
        </div>
        <Button onClick={() => setShowNewPost(true)} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Post
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar — Categories */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-semibold text-sm mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory(null)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
                style={{
                  background: !activeCategory ? "var(--bg-tertiary)" : "transparent",
                  color: !activeCategory ? "var(--color-brand-500)" : "var(--text-secondary)",
                }}
              >
                <span>All Posts</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
                  style={{
                    background: activeCategory === cat.slug ? "var(--bg-tertiary)" : "transparent",
                    color: activeCategory === cat.slug ? "var(--color-brand-500)" : "var(--text-secondary)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" /> {cat.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{cat.postCount}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main — Posts */}
        <div className="lg:col-span-3">
          {/* Search + Sort */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: "var(--text-muted)" }} />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchPosts()}
                className="pl-10"
                placeholder="Search discussions..."
              />
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
              {(["latest", "popular"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize"
                  style={{
                    background: sort === s ? "var(--bg-card)" : "transparent",
                    color: sort === s ? "var(--text-primary)" : "var(--text-muted)",
                    boxShadow: sort === s ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
            </div>
          ) : posts.length === 0 ? (
            <Card className="text-center py-16">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h2 className="text-lg font-semibold mb-2">No discussions yet</h2>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Be the first to start a conversation!
              </p>
              <Button onClick={() => setShowNewPost(true)} className="inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Start a Discussion
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <Card
                  key={post.id}
                  hoverable
                  className="group cursor-pointer"
                  onClick={() => router.push(`/dashboard/community/${post.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* Vote */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleVote(post.id); }}
                        className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold" style={{ color: post.upvotes > 0 ? "var(--color-brand-500)" : "var(--text-muted)" }}>
                        {post.upvotes}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.isPinned && <Pin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-warning-500)" }} />}
                        {post.isLocked && <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />}
                        <h3 className="font-semibold text-sm group-hover:text-[var(--color-brand-500)] transition-colors truncate">
                          {post.title}
                        </h3>
                      </div>
                      <p className="text-xs line-clamp-2 mb-2" style={{ color: "var(--text-secondary)" }}>
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full gradient-bg flex items-center justify-center text-white text-[8px] font-bold">
                            {post.author.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          {post.author.name || "Anonymous"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--bg-tertiary)" }}>
                          {post.category.name}
                        </span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.replyCount}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount}</span>
                        <span>{formatTime(post.createdAt)}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNewPost(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-2xl border animate-scale-in"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-primary)" }}>
              <h2 className="text-lg font-bold">New Discussion</h2>
              <button onClick={() => setShowNewPost(false)} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]">
                <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select
                  value={newPost.categoryId}
                  onChange={e => setNewPost(p => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input
                  value={newPost.title}
                  onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  placeholder="Share your thoughts, ask a question, or start a discussion..."
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm resize-none"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                />
              </div>
              <Button
                onClick={handleCreatePost}
                disabled={posting || !newPost.title || !newPost.content || !newPost.categoryId}
                className="w-full flex items-center justify-center gap-2"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {posting ? "Posting..." : "Post Discussion"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
