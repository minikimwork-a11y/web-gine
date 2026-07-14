"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { decodeHtml, getImages } from "@/lib/html";
import type { Post, PostNavItem } from "@/types/post";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [post, setPost] = useState<Post | null>(null);
  const [prevPost, setPrevPost] = useState<PostNavItem | null>(null);
  const [nextPost, setNextPost] = useState<PostNavItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Reset state when navigating between posts
    setLoading(true);
    setPost(null);
    setError(null);
    setCurrentSlide(0);

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

        // Fetch previous post (older)
        const publishedDate = data.published_at || data.created_at;
        const { data: prev } = await supabase
          .from("posts")
          .select("id, title")
          .eq("is_published", true)
          .lt("published_at", publishedDate)
          .order("published_at", { ascending: false })
          .limit(1)
          .single();
        setPrevPost(prev || null);

        // Fetch next post (newer)
        const { data: next } = await supabase
          .from("posts")
          .select("id, title")
          .eq("is_published", true)
          .gt("published_at", publishedDate)
          .order("published_at", { ascending: true })
          .limit(1)
          .single();
        setNextPost(next || null);
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
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight font-sans">
                {decodeHtml(post.title)}
              </h1>
              {post.excerpt && (
                <p className="text-sm sm:text-base text-white/50 border-l-2 border-[#ff3c00] pl-4 leading-relaxed">
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
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${currentSlide === idx ? "bg-[#ff3c00] w-4" : "bg-white/40 hover:bg-white/80"
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
              className="leading-relaxed text-white/85 text-sm sm:text-base space-y-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-bold [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_br]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-white [&_h4]:mt-4 [&_h4]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-white/60 [&_a]:text-[#ff3c00] [&_a]:underline"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Footer Navigation */}
            <div className="pt-12 border-t border-white/10 space-y-6">
              {/* Prev / Next Post */}
              <div className="grid grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    href={`/posts/${prevPost.id}`}
                    className="group flex flex-col gap-1.5 p-4 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <span className="text-[10px] font-mono text-white/40 tracking-wider">이전 글</span>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors line-clamp-1 font-medium">
                      &larr; {decodeHtml(prevPost.title)}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {nextPost ? (
                  <Link
                    href={`/posts/${nextPost.id}`}
                    className="group flex flex-col items-end gap-1.5 p-4 rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 text-right"
                  >
                    <span className="text-[10px] font-mono text-white/40 tracking-wider">다음 글</span>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors line-clamp-1 font-medium">
                      {decodeHtml(nextPost.title)} &rarr;
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              {/* Back to list */}
              <div className="flex justify-center">
                <Link
                  href="/posts"
                  className="text-xs font-mono text-white/40 hover:text-white/80 transition-colors py-2"
                >
                  목록으로 돌아가기
                </Link>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
