"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ThumbsUp, MessageCircle, Eye, Clock, Loader2,
  Send, Trash2, Pin, Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";

interface PostDetail {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  upvotes: number;
  viewCount: number;
  hasVoted: boolean;
  author: { id: string; name: string | null; image: string | null; role: string };
  category: { name: string; slug: string };
  replies: Reply[];
  createdAt: string;
}

interface Reply {
  id: string;
  content: string;
  upvotes: number;
  author: { id: string; name: string | null; image: string | null; role: string };
  createdAt: string;
}

const ROLE_BADGE: Record<string, { color: string; bg: string }> = {
  FOUNDER: { color: "var(--color-brand-500)", bg: "rgba(99,102,241,0.1)" },
  MENTOR: { color: "var(--color-success-500)", bg: "rgba(16,185,129,0.1)" },
  INVESTOR: { color: "var(--color-warning-500)", bg: "rgba(245,158,11,0.1)" },
  ADMIN: { color: "var(--color-danger-500)", bg: "rgba(239,68,68,0.1)" },
  SUPER_ADMIN: { color: "var(--color-danger-500)", bg: "rgba(239,68,68,0.1)" },
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (params.postId) {
      fetch(`/api/community/posts/${params.postId}`)
        .then(r => r.json())
        .then(data => {
          if (data.id) {
            setPost(data);
            setVoted(data.hasVoted);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [params.postId]);

  const handleVote = async () => {
    if (!post) return;
    try {
      const res = await fetch(`/api/community/posts/${post.id}/vote`, { method: "POST" });
      const data = await res.json();
      setVoted(data.voted);
      setPost(p => p ? { ...p, upvotes: data.voted ? p.upvotes + 1 : p.upvotes - 1 } : p);
    } catch {
      // silent
    }
  };

  const handleReply = async () => {
    if (!post || !replyContent.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/community/posts/${post.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });
      if (res.ok) {
        const reply = await res.json();
        setPost(p => p ? { ...p, replies: [...p.replies, reply] } : p);
        setReplyContent("");
      }
    } catch {
      // silent
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm("Delete this post? This cannot be undone.")) return;
    try {
      await fetch(`/api/community/posts/${post.id}`, { method: "DELETE" });
      router.push("/dashboard/community");
    } catch {
      // silent
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-brand-500)" }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p style={{ color: "var(--text-muted)" }}>Post not found</p>
        <Button onClick={() => router.push("/dashboard/community")} variant="secondary" className="mt-4">
          Back to Community
        </Button>
      </div>
    );
  }

  const isAuthor = session?.user?.id === post.author.id;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/community")}
        className="flex items-center gap-2 text-sm mb-4 hover:underline"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </button>

      {/* Post */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          {/* Vote column */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={handleVote}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: voted ? "rgba(99,102,241,0.1)" : "transparent",
                color: voted ? "var(--color-brand-500)" : "var(--text-muted)",
              }}
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold" style={{ color: voted ? "var(--color-brand-500)" : "var(--text-muted)" }}>
              {post.upvotes}
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {post.isPinned && <Pin className="w-4 h-4" style={{ color: "var(--color-warning-500)" }} />}
              {post.isLocked && <Lock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                {post.category.name}
              </span>
            </div>
            <h1 className="text-xl font-bold mb-3">{post.title}</h1>
            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4" style={{ color: "var(--text-secondary)" }}>
              {post.content}
            </p>

            {/* Author + meta */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-secondary)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                  {post.author.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{post.author.name || "Anonymous"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ ...(ROLE_BADGE[post.author.role] || ROLE_BADGE.FOUNDER) }}>
                      {post.author.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(post.createdAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount} views</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.replies.length} replies</span>
                  </div>
                </div>
              </div>
              {(isAuthor || isAdmin) && (
                <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors" style={{ color: "var(--color-danger-500)" }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Replies */}
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" style={{ color: "var(--color-brand-500)" }} />
        {post.replies.length} {post.replies.length === 1 ? "Reply" : "Replies"}
      </h3>

      {post.replies.length > 0 && (
        <div className="space-y-3 mb-6">
          {post.replies.map(reply => (
            <Card key={reply.id}>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {reply.author.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{reply.author.name || "Anonymous"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ ...(ROLE_BADGE[reply.author.role] || ROLE_BADGE.FOUNDER) }}>
                      {reply.author.role}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatTime(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{reply.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reply form */}
      {!post.isLocked ? (
        <Card>
          <h4 className="text-sm font-semibold mb-3">Add a Reply</h4>
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border bg-transparent text-sm resize-none mb-3"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          />
          <Button
            onClick={handleReply}
            disabled={replying || !replyContent.trim()}
            className="flex items-center gap-2"
          >
            {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {replying ? "Posting..." : "Post Reply"}
          </Button>
        </Card>
      ) : (
        <Card className="text-center py-6">
          <Lock className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>This discussion is locked</p>
        </Card>
      )}
    </div>
  );
}
