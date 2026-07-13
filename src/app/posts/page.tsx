"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/ui/navbar";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string;
  created_at: string;
}

const decodeHtml = (html: string | null): string => {
  if (!html) return "";
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

const getCoverImageUrl = (coverImage: string | null): string => {
  if (!coverImage) return "";
  if (coverImage.startsWith("[")) {
    try {
      const parsed = JSON.parse(coverImage);
      return parsed[0] || "";
    } catch {
      return coverImage;
    }
  }
  return coverImage;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, excerpt, cover_image, published_at, created_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-[#ff3c00] selection:text-white relative pb-20 overflow-x-hidden">
      {/* Visual highlights */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#ff3c00]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Shared Navbar */}
      <Navbar />

      {/* Hero Section of Posts Page */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="max-w-3xl">
          <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block mb-2 uppercase">
            소식 및 이야기
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none mb-4 font-serif">
            보금자리 웹진
          </h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            1004 보금자리에서 함께 나누는 소중한 일상과 이웃들의 아름다운 만남, 그리고 따뜻한 이야기들을 모았습니다.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/[0.01] border border-white/5 rounded-2xl h-96 animate-pulse flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="h-44 bg-white/5 rounded-xl w-full" />
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                </div>
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-white/10 bg-black/40 rounded-3xl p-16 text-center max-w-xl mx-auto my-12 backdrop-blur-xl">
            <span className="text-4xl block mb-4">☕</span>
            <h3 className="text-lg font-bold text-white mb-2">아직 발행된 웹진이 없습니다.</h3>
            <p className="text-xs text-white/40 leading-normal">
              관리자 페이지에서 첫 게시글을 작성하고 공개 발행해 보세요. 따뜻한 이야기로 채워질 예정입니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
            {posts.map((post) => {
              const coverUrl = getCoverImageUrl(post.cover_image);
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="group bg-black/30 border border-white/10 hover:border-[#ff3c00]/30 hover:bg-black/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-lg relative border-beam-card"
                >
                  <div className="border-beam-container" />
                  {/* Image container */}
                  {coverUrl ? (
                    <div className="h-48 w-full overflow-hidden bg-zinc-950 border-b border-white/5 relative">
                      <img
                        src={coverUrl}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-zinc-950 flex items-center justify-center border-b border-white/5 font-mono text-[10px] text-white/20">
                      NO COVER IMAGE
                    </div>
                  )}

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-[#ff3c00] tracking-wider font-bold">
                      {new Date(post.published_at || post.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#ff3c00] transition-colors leading-snug line-clamp-2 font-serif">
                      {decodeHtml(post.title)}
                    </h3>
                    <p className="text-white/60 text-xs line-clamp-3 leading-relaxed">
                      {decodeHtml(post.excerpt) || "이야기 보러가기를 클릭해 전체 내용을 확인해 보세요."}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-mono text-white/50 group-hover:text-white flex items-center gap-1.5 transition-colors">
                    자세히 읽기 <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>
            );
          })}
          </div>
        )}
      </main>
    </div>
  );
}
