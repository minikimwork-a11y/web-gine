"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { decodeHtml, getCoverImageUrl, getImages, sanitizeHtml } from "@/lib/html";
import type { Post, PostSummary } from "@/types/post";

const POSTS_PER_PAGE = 6;

export default function PostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Bottom sheet state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Carousel state for bottom sheet
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchPublishedPosts = useCallback(async (pageIndex: number, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const from = pageIndex * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, excerpt, cover_image, published_at, created_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newPosts = data || [];
      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      if (newPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPublishedPosts(0, true);
  }, [fetchPublishedPosts]);

  const loadMorePosts = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPublishedPosts(nextPage, false);
  };

  // Fetch full post data for bottom sheet
  const openPostDetail = useCallback(async (postId: string) => {
    setDetailLoading(true);
    setSheetOpen(true);
    setCurrentSlide(0);

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      setSelectedPost(data);
    } catch (err) {
      console.error("Error fetching post detail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeSheet = () => {
    setSheetOpen(false);
    setSelectedPost(null);
  };

  // Carousel helpers
  const images = selectedPost ? getImages(selectedPost.cover_image) : [];
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNextSlide = () => setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Share handler
  const handleShare = async () => {
    if (!selectedPost) return;
    const shareUrl = `${window.location.origin}/posts/${selectedPost.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: decodeHtml(selectedPost.title),
          url: shareUrl,
        });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 복사되었습니다!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-[#ff3c00] selection:text-white relative flex flex-col overflow-x-hidden">
      {/* Visual highlights */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#ff3c00]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Shared Navbar */}
      <Navbar />

      {/* Hero Section of Posts Page */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mb-4 font-sans">
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
                <button
                  key={post.id}
                  onClick={() => openPostDetail(post.id)}
                  className="group bg-black/30 border border-white/10 hover:border-[#ff3c00]/30 hover:bg-black/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-lg relative border-beam-card text-left cursor-pointer"
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
                      <h3 className="text-lg font-bold text-white group-hover:text-[#ff3c00] transition-colors leading-snug line-clamp-2 font-sans">
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
                </button>
              );
            })}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && posts.length > 0 && (
          <div className="flex justify-center mt-12 mb-6">
            <button
              onClick={loadMorePosts}
              disabled={loadingMore}
              className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-[#ff3c00]/40 bg-zinc-900/60 hover:bg-zinc-800 text-sm font-bold text-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl cursor-pointer disabled:opacity-50 disabled:pointer-events-none backdrop-blur-md"
              style={{
                clipPath: "polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)",
              }}
            >
              {loadingMore ? "이야기 불러오는 중..." : "더 많은 이야기 보기 ↓"}
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* ===== Bottom Sheet Modal for Post Detail ===== */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={closeSheet}
        title={selectedPost ? decodeHtml(selectedPost.title) : "로딩 중..."}
      >
        {detailLoading ? (
          <div className="space-y-6 animate-pulse py-8">
            <div className="h-4 bg-white/5 rounded w-1/4" />
            <div className="h-8 bg-white/5 rounded w-3/4" />
            <div className="h-56 bg-white/5 rounded-2xl w-full" />
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
            </div>
          </div>
        ) : selectedPost ? (
          <article className="space-y-6 animate-fadeIn">
            {/* Meta */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#ff3c00] tracking-widest font-bold block uppercase">
                {new Date(selectedPost.published_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {selectedPost.excerpt && (
                <p className="text-sm text-white/50 border-l-2 border-[#ff3c00] pl-4 leading-relaxed">
                  {decodeHtml(selectedPost.excerpt)}
                </p>
              )}
            </div>

            {/* Images Carousel */}
            {images.length > 0 && (
              <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-zinc-950 group/carousel">
                {/* Slides Track */}
                <div className="relative h-[220px] sm:h-[320px] w-full overflow-hidden">
                  <div
                    className="flex h-full w-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {images.map((imgSrc, idx) => (
                      <div key={idx} className="flex-shrink-0 w-full h-full relative flex items-center justify-center overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-105 pointer-events-none"
                          style={{ backgroundImage: `url(${imgSrc})` }}
                        />
                        <img
                          src={imgSrc}
                          alt={`${selectedPost.title} 사진 ${idx + 1}`}
                          className="relative z-10 max-h-full w-auto object-contain mx-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows - always visible on mobile */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#ff3c00] text-white p-3 rounded-full z-20 transition-all opacity-70 md:opacity-0 md:group-hover/carousel:opacity-100 cursor-pointer shadow-lg"
                      aria-label="이전 사진"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#ff3c00] text-white p-3 rounded-full z-20 transition-all opacity-70 md:opacity-0 md:group-hover/carousel:opacity-100 cursor-pointer shadow-lg"
                      aria-label="다음 사진"
                    >
                      &rarr;
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
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
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Body Content */}
            <div
              className="leading-relaxed text-white/85 text-sm sm:text-base space-y-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-bold [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_br]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-white [&_h4]:mt-4 [&_h4]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-white/60 [&_a]:text-[#ff3c00] [&_a]:underline [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedPost.content) }}
            />

            {/* Action Buttons */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:border-[#ff3c00]/30 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white transition-all duration-300 cursor-pointer text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" x2="12" y1="2" y2="15" />
                  </svg>
                  공유하기
                </button>
                <button
                  onClick={closeSheet}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white transition-all duration-300 cursor-pointer text-sm font-medium border border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  닫기
                </button>
              </div>
            </div>
          </article>
        ) : null}
      </BottomSheet>
    </div>
  );
}
