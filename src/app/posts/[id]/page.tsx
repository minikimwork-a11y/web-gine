"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/ui/navbar";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
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

const getImages = (coverImage: string | null): string[] => {
  if (!coverImage) return [];
  if (coverImage.startsWith("[")) {
    try {
      return JSON.parse(coverImage);
    } catch {
      return [coverImage];
    }
  }
  return [coverImage];
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolve params using React.use (or React.use(params) equivalent)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .eq("is_published", true)
          .single();

        if (fetchError) {
          throw new Error("게시글을 찾을 수 없거나 비공개 상태입니다.");
        }

        setPost(data);
      } catch (err: any) {
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const images = post ? getImages(post.cover_image) : [];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-[#ff3c00] selection:text-white relative pb-24 overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#ff3c00]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Shared Navbar */}
      <Navbar />

      {/* Main Post Detail */}
      <main className="max-w-3xl mx-auto px-6 pt-12 relative z-10">
        {loading ? (
          <div className="space-y-6 animate-pulse py-12">
            <div className="h-4 bg-white/5 rounded w-1/4" />
            <div className="h-10 bg-white/5 rounded w-3/4" />
            <div className="h-64 bg-white/5 rounded-3xl w-full" />
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
            </div>
          </div>
        ) : error || !post ? (
          <div className="border border-white/10 bg-black/40 rounded-3xl p-16 text-center my-12 backdrop-blur-xl">
            <span className="text-4xl block mb-4">⚠️</span>
            <h3 className="text-lg font-bold text-white mb-2">{error || "게시글을 찾을 수 없습니다."}</h3>
            <p className="text-xs text-white/40 leading-normal mb-6">
              삭제된 게시글이거나 발행이 취소된 게시글일 수 있습니다.
            </p>
            <Link
              href="/posts"
              className="inline-block bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-xs font-mono transition-colors"
            >
              목록으로 돌아가기
            </Link>
          </div>
        ) : (
          <article className="space-y-8 animate-fadeIn">
            {/* Meta */}
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#ff3c00] tracking-widest font-bold block uppercase">
                {new Date(post.published_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-serif">
                {decodeHtml(post.title)}
              </h1>
              {post.excerpt && (
                <p className="text-sm sm:text-base text-white/50 border-l-2 border-[#ff3c00] pl-4 italic leading-relaxed">
                  {decodeHtml(post.excerpt)}
                </p>
              )}
            </div>

            {/* Images Carousel */}
            {images.length > 0 && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 group/carousel">
                {/* Slides Track */}
                <div className="relative h-[250px] sm:h-[380px] md:h-[450px] w-full overflow-hidden">
                  <div
                    className="flex h-full w-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {images.map((imgSrc, idx) => (
                      <div key={idx} className="flex-shrink-0 w-full h-full relative flex items-center justify-center overflow-hidden">
                        {/* Blurred background to fill portrait photos */}
                        <div
                          className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-105 pointer-events-none"
                          style={{ backgroundImage: `url(${imgSrc})` }}
                        />
                        {/* Real image */}
                        <img
                          src={imgSrc}
                          alt={`${post.title} 사진 ${idx + 1}`}
                          className="relative z-10 max-h-full w-auto object-contain mx-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#ff3c00] text-white p-2.5 rounded-full z-20 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer shadow-md"
                      aria-label="이전 사진"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#ff3c00] text-white p-2.5 rounded-full z-20 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer shadow-md"
                      aria-label="다음 사진"
                    >
                      &rarr;
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            currentSlide === idx ? "bg-[#ff3c00] w-4" : "bg-white/40 hover:bg-white/80"
                          }`}
                          aria-label={`${idx + 1}번째 슬라이드로 이동`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />

            {/* Body Content */}
            <div
              className="leading-relaxed text-white/85 text-sm sm:text-base space-y-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-bold [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_br]:mb-2"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Footer Navigation */}
            <div className="pt-12 border-t border-white/10 flex justify-between items-center text-xs font-mono">
              <Link href="/posts" className="text-white/60 hover:text-white transition-colors">
                &larr; 목록으로 돌아가기
              </Link>
              <span className="text-white/20">1004 보금자리 웹진</span>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
