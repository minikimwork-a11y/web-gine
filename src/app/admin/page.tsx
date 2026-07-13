"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

interface Sponsorship {
  id: string;
  type: string;
  amount: number | null;
  pay_method: string | null;
  goods_desc: string | null;
  goods_photo_url: string | null;
  goods_valuation: number | null;
  amount_desc: string | null;
  name: string;
  phone: string;
  fax: string | null;
  email: string | null;
  address_type: string;
  zipcode: string | null;
  address: string | null;
  address_detail: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_holder: string | null;
  bank_birth: string | null;
  pay_date: string | null;
  receipt_opt: string;
  jumin_no: string | null;
  signature_data: string | null;
  holder_signature_data: string | null;
  created_at: string;
}

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

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

type TabType = "dashboard" | "posts" | "editor" | "sponsorships";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const router = useRouter();

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Editor states
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorExcerpt, setEditorExcerpt] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorCoverImages, setEditorCoverImages] = useState<string[]>([]);
  const [editorPublishedAt, setEditorPublishedAt] = useState(getTodayDateString());
  const [editorIsPublished, setEditorIsPublished] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  const insertTag = (beforeVal: string, afterVal: string) => {
    const textarea = document.getElementById("admin-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = beforeVal + selected + afterVal;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setEditorContent(newContent);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + beforeVal.length,
        start + beforeVal.length + selected.length
      );
    }, 0);
  };

  const handleInsertLink = () => {
    const url = prompt("연결할 링크 URL 주소를 입력하세요:", "https://");
    if (url) {
      insertTag(`<a href="${url}" target="_blank" className="text-[#ff3c00] hover:underline font-semibold">`, "</a>");
    }
  };

  const handleInsertImage = (imgUrl: string) => {
    insertTag(`\n<img src="${imgUrl}" className="w-full rounded-2xl my-6 object-cover shadow-md" alt="본문 이미지" />\n`, "");
  };

  // Sponsorship states
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loadingSpons, setLoadingSpons] = useState(false);
  const [selectedSpons, setSelectedSpons] = useState<Sponsorship | null>(null);

  // Status and stats states
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalSponsorships: 0,
  });

  // Authentication check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  // Fetch initial stats and overview data
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Fetch lists based on active tab
  useEffect(() => {
    if (!user) return;

    if (activeTab === "posts") {
      fetchPosts();
    } else if (activeTab === "sponsorships") {
      fetchSponsorships();
    } else if (activeTab === "dashboard") {
      fetchStats();
    }
  }, [activeTab, user]);

  const fetchStats = async () => {
    try {
      const { count: postsCount, error: postsErr } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      const { count: pubCount, error: pubErr } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      const { count: sponsCount, error: sponsErr } = await supabase
        .from("sponsorships")
        .select("*", { count: "exact", head: true });

      if (!postsErr && !pubErr && !sponsErr) {
        setStats({
          totalPosts: postsCount || 0,
          publishedPosts: pubCount || 0,
          totalSponsorships: sponsCount || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchPosts = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      alert(`게시글을 불러오는 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSponsorships = async () => {
    setLoadingSpons(true);
    try {
      const { data, error } = await supabase
        .from("sponsorships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSponsorships(data || []);
    } catch (err: any) {
      alert(`후원 신청을 불러오는 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoadingSpons(false);
    }
  };

  const handleDeleteSponsorship = async (id: string) => {
    if (!confirm("정말 이 후원 신청 기록을 삭제하시겠습니까? (삭제 후 복구 불가)")) return;

    try {
      const { error } = await supabase
        .from("sponsorships")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setSponsorships((prev) => prev.filter((s) => s.id !== id));
      fetchStats();
      if (selectedSpons?.id === id) {
        setSelectedSpons(null);
      }
      alert("후원 신청 기록이 삭제되었습니다.");
    } catch (err: any) {
      alert(`후원 신청 삭제에 실패했습니다: ${err.message}`);
    }
  };

  const getTypeName = (t: string) => {
    switch (t) {
      case "regular":
        return "정기 후원";
      case "temporary":
        return "일시 후원";
      case "goods":
        return "물품 후원";
      case "volunteer":
        return "자원 봉사";
      default:
        return t;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Image upload handling (multiple files support)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("webzine")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("webzine")
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }
      setEditorCoverImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error(err);
      alert(`이미지 업로드에 실패했습니다: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Create or edit post submit
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle.trim() || !editorContent.trim()) {
      alert("제목과 본문을 입력해주세요.");
      return;
    }

    setSubmittingPost(true);
    try {
      const postPayload: any = {
        title: editorTitle,
        excerpt: editorExcerpt || null,
        content: editorContent,
        cover_image: editorCoverImages.length > 0 ? JSON.stringify(editorCoverImages) : null,
        is_published: editorIsPublished,
        published_at: editorIsPublished 
          ? new Date(`${editorPublishedAt}T00:00:00`).toISOString()
          : null,
      };

      if (editingPost) {
        // Edit Mode
        const { error } = await supabase
          .from("posts")
          .update(postPayload)
          .eq("id", editingPost.id);

        if (error) throw error;
        alert("게시글이 성공적으로 수정되었습니다.");
      } else {
        // Create Mode
        const { error } = await supabase
          .from("posts")
          .insert([postPayload]);

        if (error) throw error;
        alert("게시글이 성공적으로 작성되었습니다.");
      }

      // Reset editor and refresh posts
      resetEditor();
      setActiveTab("posts");
    } catch (err: any) {
      alert(`게시글 저장에 실패했습니다: ${err.message}`);
    } finally {
      setSubmittingPost(false);
    }
  };

  const startCreateMode = () => {
    resetEditor();
    setActiveTab("editor");
  };

  const startEditMode = (post: Post) => {
    setEditingPost(post);
    setEditorTitle(post.title);
    setEditorExcerpt(post.excerpt || "");
    setEditorContent(post.content);
    if (post.cover_image) {
      if (post.cover_image.startsWith("[")) {
        try {
          setEditorCoverImages(JSON.parse(post.cover_image));
        } catch {
          setEditorCoverImages([post.cover_image]);
        }
      } else {
        setEditorCoverImages([post.cover_image]);
      }
    } else {
      setEditorCoverImages([]);
    }
    if (post.published_at) {
      const date = new Date(post.published_at);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      setEditorPublishedAt(`${yyyy}-${mm}-${dd}`);
    } else {
      setEditorPublishedAt(getTodayDateString());
    }
    setEditorIsPublished(post.is_published);
    setActiveTab("editor");
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setPosts(posts.filter((p) => p.id !== id));
      fetchStats();
      alert("게시글이 삭제되었습니다.");
    } catch (err: any) {
      alert(`게시글 삭제에 실패했습니다: ${err.message}`);
    }
  };

  const resetEditor = () => {
    setEditingPost(null);
    setEditorTitle("");
    setEditorExcerpt("");
    setEditorContent("");
    setEditorCoverImages([]);
    setEditorPublishedAt(getTodayDateString());
    setEditorIsPublished(false);
    setEditorTab("write");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setEditorCoverImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    setEditorCoverImages((prev) => {
      const nextList = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      const temp = nextList[index];
      nextList[index] = nextList[targetIndex];
      nextList[targetIndex] = temp;
      return nextList;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">
        Checking authentication session...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] flex flex-col md:flex-row relative font-sans selection:bg-[#ff3c00] selection:text-white">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff3c00]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-black/60 border-b md:border-b-0 md:border-r border-white/10 backdrop-blur-xl flex flex-col justify-between z-10">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3c00] animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight text-white uppercase font-mono">
              1004_CONSOLE
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm flex items-center gap-3 ${
                activeTab === "dashboard"
                  ? "bg-[#ff3c00]/10 text-[#ff3c00] font-semibold border-l-2 border-[#ff3c00]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              📊 DASHBOARD
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm flex items-center gap-3 ${
                activeTab === "posts" || activeTab === "editor"
                  ? "bg-[#ff3c00]/10 text-[#ff3c00] font-semibold border-l-2 border-[#ff3c00]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              📝 WEBZINE POSTS
            </button>
            <button
              onClick={() => setActiveTab("sponsorships")}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-mono text-sm flex items-center gap-3 ${
                activeTab === "sponsorships"
                  ? "bg-[#ff3c00]/10 text-[#ff3c00] font-semibold border-l-2 border-[#ff3c00]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              💖 SPONSORSHIPS
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="text-xs font-mono text-white/50 px-2">
            <div>USER:</div>
            <div className="text-white truncate font-medium">{user.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-white/5 hover:bg-[#ff3c00]/20 hover:text-[#ff3c00] border border-white/10 hover:border-[#ff3c00]/30 transition-all duration-300 font-mono text-xs py-2.5 rounded-lg cursor-pointer text-center block"
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto max-w-6xl z-10">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block mb-1">
                SYSTEM SUMMARY
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
                Console Dashboard
              </h2>
            </div>

            {/* Welcome Dashboard Box */}
            <div className="bg-black/40 border border-white/10 backdrop-blur-xl p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff3c00] to-transparent" />
              <h3 className="text-xl font-bold text-white mb-4">1004 보금자리 웹진 관리 시스템</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                보금자리 웹진의 게시글 작성, 수정, 삭제 및 이미지 업로드를 관리하는 대시보드입니다. 모든 데이터는 Supabase 데이터베이스와 안전하게 연동되어 있습니다.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-xs font-mono text-white/40 block mb-1">DATABASE CONNECTION</span>
                  <span className="text-sm font-semibold text-emerald-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    CONNECTED TO SUPABASE
                  </span>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-xs font-mono text-white/40 block mb-1">ROLES</span>
                  <span className="text-sm font-semibold text-white">SYSTEM OWNER</span>
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                <span className="text-xs font-mono text-white/40 uppercase">Total Webzine Posts</span>
                <span className="text-4xl font-extrabold text-white mt-4">{stats.totalPosts}</span>
                <span className="text-xs text-white/30 mt-2">전체 등록된 웹진 콘텐츠</span>
              </div>
              <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                <span className="text-xs font-mono text-white/40 uppercase">Published Posts</span>
                <span className="text-4xl font-extrabold text-[#ff3c00] mt-4">{stats.publishedPosts}</span>
                <span className="text-xs text-white/30 mt-2">현재 공개 송출 중인 웹진</span>
              </div>
              <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                <span className="text-xs font-mono text-white/40 uppercase">Total Sponsorships</span>
                <span className="text-4xl font-extrabold text-emerald-500 mt-4">{stats.totalSponsorships}</span>
                <span className="text-xs text-white/30 mt-2">온라인 접수된 후원/봉사</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-black/40 border border-white/10 p-8 rounded-2xl relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={startCreateMode}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 text-left p-5 rounded-xl transition-all duration-300 text-sm text-white/80 hover:text-white flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-white mb-1">새 웹진 포스트 작성</div>
                    <div className="text-xs text-white/40">커버 이미지 업로드 및 에디터 열기</div>
                  </div>
                  <span className="font-mono text-lg text-[#ff3c00] group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === "posts" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block mb-1">
                  POSTS LIST
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
                  Webzine Posts
                </h2>
              </div>
              <button
                onClick={startCreateMode}
                className="bg-[#ff3c00] hover:bg-[#ff5522] text-white font-bold px-5 py-3 rounded-lg text-sm transition-all duration-300 shadow-lg cursor-pointer font-mono"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 75%, 93% 100%, 0 100%)",
                }}
              >
                + WRITE NEW POST
              </button>
            </div>

            {loadingData ? (
              <div className="text-center font-mono py-12 text-white/40">게시글을 불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-12 text-center text-white/45">
                등록된 게시글이 없습니다. 첫 웹진을 발행해 보세요!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden hover:border-[#ff3c00]/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {post.cover_image ? (
                        <div className="h-40 w-full relative overflow-hidden bg-zinc-900 border-b border-white/10">
                          <img
                            src={getCoverImageUrl(post.cover_image)}
                            alt={post.title}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-40 w-full bg-zinc-950/60 border-b border-white/10 flex items-center justify-center text-xs font-mono text-white/20">
                          NO COVER IMAGE
                        </div>
                      )}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                              post.is_published
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}
                          >
                            {post.is_published ? "PUBLISHED" : "DRAFT"}
                          </span>
                          <span className="text-xs font-mono text-white/35">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white hover:text-[#ff3c00] transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                          {post.excerpt || "요약 정보가 없습니다."}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
                      <button
                        onClick={() => startEditMode(post)}
                        className="text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-xs font-mono bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 px-3 py-1.5 rounded text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDITOR TAB */}
        {activeTab === "editor" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block mb-1">
                {editingPost ? "EDIT POST CONTENT" : "WRITE NEW CONTENT"}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
                {editingPost ? "Edit Webzine Post" : "Create Webzine Post"}
              </h2>
            </div>

            <form onSubmit={handleSavePost} className="space-y-6 bg-black/40 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">
                  Title (제목) <span className="text-[#ff3c00]">*</span>
                </label>
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  required
                  placeholder="웹진 제목을 입력하세요."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#ff3c00]/60 focus:bg-white/[0.08]"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">
                  Excerpt (요약)
                </label>
                <textarea
                  value={editorExcerpt}
                  onChange={(e) => setEditorExcerpt(e.target.value)}
                  placeholder="리스트 피드에 표시될 짧은 설명글을 입력하세요."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#ff3c00]/60 focus:bg-white/[0.08]"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">
                  Cover Image (커버 이미지)
                </label>
                
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {editorCoverImages.length > 0 ? (
                    <div className="flex flex-wrap gap-4 flex-shrink-0">
                      {editorCoverImages.map((imgUrl, index) => (
                        <div key={index} className="h-24 w-36 relative border border-white/15 rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 group/thumbnail">
                          <img src={getCoverImageUrl(imgUrl)} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(index, "left")}
                                className="bg-black/80 hover:bg-[#ff3c00] text-white p-1 rounded transition-colors text-[10px] w-5 h-5 flex items-center justify-center cursor-pointer font-bold"
                                title="왼쪽으로 이동"
                              >
                                &larr;
                              </button>
                            )}
                            {index < editorCoverImages.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(index, "right")}
                                className="bg-black/80 hover:bg-[#ff3c00] text-white p-1 rounded transition-colors text-[10px] w-5 h-5 flex items-center justify-center cursor-pointer font-bold"
                                title="오른쪽으로 이동"
                              >
                                &rarr;
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="bg-black/80 hover:bg-red-600 text-white p-1 rounded transition-colors text-[10px] w-5 h-5 flex items-center justify-center cursor-pointer font-bold"
                              title="삭제"
                            >
                              ✕
                            </button>
                          </div>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-[#ff3c00] text-white font-bold text-[8px] px-1 py-0.5 rounded uppercase tracking-wider z-20 shadow-md">
                              COVER
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-24 w-36 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center bg-white/[0.01] text-xs font-mono text-white/30 flex-shrink-0">
                      {uploadingImage ? "UPLOADING..." : "NO COVER IMAGE"}
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="cover-upload"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      multiple
                      className="hidden"
                    />
                    <label
                      htmlFor="cover-upload"
                      className={`inline-block px-4 py-2.5 rounded-lg border border-white/10 hover:border-[#ff3c00]/30 hover:bg-white/5 text-xs font-mono cursor-pointer transition-all ${
                        uploadingImage ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {uploadingImage ? "업로드 중..." : "SELECT & UPLOAD IMAGES"}
                    </label>
                    <p className="text-[10px] text-white/40 leading-normal">
                      PNG, JPG, WEBP 이미지 다중 선택 업로드 지원. <br />
                      마우스 오버 시 순서 변경 및 삭제가 가능하며 첫 번째 이미지가 대표 커버(COVER)로 지정됩니다.
                    </p>
                  </div>
                </div>
              </div>


              {/* Content Editor with Toolbar & Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">
                    Content (본문) <span className="text-[#ff3c00]">*</span>
                  </label>
                  
                  {/* Tab switches */}
                  <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-0.5 text-[10px] font-mono select-none">
                    <button
                      type="button"
                      onClick={() => setEditorTab("write")}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        editorTab === "write"
                          ? "bg-[#ff3c00] text-white font-bold"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      WRITE (작성)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        editorTab === "preview"
                          ? "bg-[#ff3c00] text-white font-bold"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      PREVIEW (미리보기)
                    </button>
                  </div>
                </div>

                {editorTab === "write" ? (
                  <div className="space-y-2">
                    {/* Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-900 border border-white/10 border-b-0 rounded-t-lg select-none">
                      <button
                        type="button"
                        onClick={() => insertTag("<strong>", "</strong>")}
                        className="p-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-bold font-mono text-white/70 cursor-pointer transition-all"
                        title="굵게"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("<em>", "</em>")}
                        className="p-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] italic font-mono text-white/70 cursor-pointer transition-all"
                        title="기울임"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("<u>", "</u>")}
                        className="p-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] underline font-mono text-white/70 cursor-pointer transition-all"
                        title="밑줄"
                      >
                        U
                      </button>
                      <span className="w-[1px] h-4 bg-white/10 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertTag("<h2>", "</h2>")}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="대제목 (H2)"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("<h3>", "</h3>")}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="소제목 (H3)"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("<blockquote>", "</blockquote>")}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="인용구"
                      >
                        인용구
                      </button>
                      <span className="w-[1px] h-4 bg-white/10 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="글머리 기호 목록"
                      >
                        • 목록
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("<ol>\n  <li>", "</li>\n</ol>")}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="번호 매기기 목록"
                      >
                        1. 목록
                      </button>
                      <span className="w-[1px] h-4 bg-white/10 mx-1" />
                      <button
                        type="button"
                        onClick={handleInsertLink}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="하이퍼링크 삽입"
                      >
                        링크
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<span className="text-[#ff3c00] font-bold">', "</span>")}
                        className="p-1 px-2 rounded bg-[#ff3c00]/10 hover:bg-[#ff3c00]/25 text-[#ff3c00] border border-[#ff3c00]/20 text-[10px] font-mono cursor-pointer transition-all font-bold"
                        title="주황색으로 글자 강조"
                      >
                        주황강조
                      </button>
                      <span className="w-[1px] h-4 bg-white/10 mx-1" />
                      <button
                        type="button"
                        onClick={() => insertTag("<p>", "</p>")}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="문단 분리"
                      >
                        단락
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("", "<br />")}
                        className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-white/5 text-[10px] font-mono text-white/70 cursor-pointer transition-all"
                        title="줄바꿈"
                      >
                        줄바꿈
                      </button>
                    </div>

                    <textarea
                      id="admin-editor-textarea"
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      required
                      placeholder="웹진 내용을 입력하세요. 상단의 서식 도구를 이용하거나 직접 HTML 태그를 입력할 수 있습니다."
                      rows={12}
                      className="w-full bg-white/5 border border-white/10 rounded-b-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#ff3c00]/60 focus:bg-white/[0.08] font-mono leading-relaxed"
                    />

                    {/* Image Embed Helper section */}
                    {editorCoverImages.length > 0 && (
                      <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-3 space-y-2">
                        <span className="text-[10px] font-mono text-white/55 block">
                          📷 본문 내 이미지 삽입 (클릭 시 현재 커서 위치에 바로 삽입됩니다):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {editorCoverImages.map((imgUrl, index) => (
                            <div
                              key={index}
                              onClick={() => handleInsertImage(imgUrl)}
                              className="w-14 h-10 rounded border border-white/10 overflow-hidden cursor-pointer hover:border-[#ff3c00] active:scale-95 transition-all relative group"
                              title="본문에 삽입하려면 클릭"
                            >
                              <img src={imgUrl} alt={`Thumbnail ${index}`} className="object-cover w-full h-full" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] text-white font-bold font-mono">ADD</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Preview Mode */
                  <div className="bg-[#f8f9fa] border border-zinc-200 text-[#2d2d2d] rounded-lg p-6 sm:p-8 min-h-[300px] max-h-[500px] overflow-y-auto font-sans selection:bg-[#ff3c00] selection:text-white relative">
                    <span className="absolute top-2 right-2 text-[9px] font-mono text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded pointer-events-none uppercase">
                      HTML Live Preview
                    </span>
                    {editorContent.trim() ? (
                      <div
                        className="leading-relaxed text-zinc-700 text-sm sm:text-base space-y-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-bold [&_strong]:text-zinc-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_br]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-zinc-900 [&_h3]:mt-4 [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-500 [&_a]:text-[#ff3c00] [&_a]:underline"
                        style={{ wordBreak: "break-word" }}
                        dangerouslySetInnerHTML={{ __html: editorContent }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] text-zinc-400 text-xs">
                        <span>본문에 작성된 내용이 없습니다.</span>
                        <span className="text-[10px] mt-1 text-zinc-400/70">작성 탭에서 내용을 입력한 뒤 돌아와 주세요.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Publish Toggle & Date Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 py-4 border-y border-white/5 my-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="publish-toggle"
                    checked={editorIsPublished}
                    onChange={(e) => setEditorIsPublished(e.target.checked)}
                    className="w-4 h-4 bg-white/5 border border-white/10 rounded accent-[#ff3c00] cursor-pointer"
                  />
                  <label htmlFor="publish-toggle" className="text-xs font-mono text-white/80 cursor-pointer uppercase select-none">
                    공개 발행 상태로 설정 (Publish)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="publish-date" className="text-xs font-mono text-white/60">
                    발행 날짜 지정:
                  </label>
                  <input
                    type="date"
                    id="publish-date"
                    value={editorPublishedAt}
                    onChange={(e) => setEditorPublishedAt(e.target.value)}
                    required
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none transition-all duration-300 focus:border-[#ff3c00]/60 focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    resetEditor();
                    setActiveTab("posts");
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingPost || uploadingImage}
                  className="bg-[#ff3c00] hover:bg-[#ff5522] disabled:bg-white/10 disabled:text-white/20 font-bold px-6 py-3 rounded-lg text-xs tracking-wider transition-all shadow-lg cursor-pointer"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 75%, 93% 100%, 0 100%)",
                  }}
                >
                  {submittingPost ? "SAVING..." : "SAVE POST"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SPONSORSHIPS TAB */}
        {activeTab === "sponsorships" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="font-mono text-xs text-[#ff3c00] tracking-widest font-bold block mb-1">
                APPLICATIONS
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
                Sponsorship List
              </h2>
            </div>

            {loadingSpons ? (
              <div className="text-center font-mono py-12 text-white/40">후원 내역을 불러오는 중...</div>
            ) : sponsorships.length === 0 ? (
              <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-12 text-center text-white/45 font-sans text-xs">
                접수된 후원 및 자원봉사 신청서가 없습니다.
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Side: List */}
                <div className="w-full lg:w-5/12 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {sponsorships.map((spons) => (
                    <div
                      key={spons.id}
                      onClick={() => setSelectedSpons(spons)}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                        selectedSpons?.id === spons.id
                          ? "bg-[#ff3c00]/10 border-[#ff3c00] text-white"
                          : "bg-black/30 border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-white text-sm font-bold block">{spons.name}</strong>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                            spons.type === "regular"
                              ? "bg-[#ff3c00]/10 text-[#ff3c00] border-[#ff3c00]/20"
                              : spons.type === "temporary"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : spons.type === "goods"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}
                        >
                          {spons.type === "regular"
                            ? "정기"
                            : spons.type === "temporary"
                            ? "일시"
                            : spons.type === "goods"
                            ? "물품"
                            : "봉사"}
                        </span>
                      </div>
                      <div className="space-y-1 font-mono text-[10px] text-white/40">
                        <div>연락처: <span className="text-white/70 font-sans">{spons.phone}</span></div>
                        {spons.amount && (
                          <div>금액: <span className="text-[#ff3c00] font-sans font-bold">{spons.amount.toLocaleString()} 원</span></div>
                        )}
                        {spons.goods_desc && (
                          <div className="truncate">물품: <span className="text-white/70 font-sans">{spons.goods_desc}</span></div>
                        )}
                        <div className="text-[9px] pt-1 text-white/20">
                          신청일: {new Date(spons.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Side: Details Card */}
                <div className="w-full lg:w-7/12">
                  {selectedSpons ? (
                    <div className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden space-y-6 animate-fadeIn">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff3c00] to-transparent" />
                      
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div>
                          <span className="text-[10px] font-mono text-white/40 block">APPLICANT DOCUMENT</span>
                          <h4 className="text-base font-bold text-white font-serif">{selectedSpons.name}님의 신청서</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteSponsorship(selectedSpons.id)}
                            className="bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>

                      {/* Info Table layout */}
                      <div className="space-y-4 text-xs font-sans">
                        <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                          <span className="text-white/40 font-mono">후원 유형</span>
                          <span className="col-span-2 text-white font-bold">{getTypeName(selectedSpons.type)}</span>
                        </div>

                        {selectedSpons.amount && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">후원 금액</span>
                            <span className="col-span-2 text-[#ff3c00] font-bold font-mono">
                              {selectedSpons.amount.toLocaleString()} 원
                            </span>
                          </div>
                        )}

                        {selectedSpons.pay_method && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">입금 방식</span>
                            <span className="col-span-2 text-white font-bold">
                              {selectedSpons.pay_method === "CMS" ? "CMS 자동이체 계좌 등록" : "직접 계좌송금"}
                            </span>
                          </div>
                        )}

                        {selectedSpons.goods_desc && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">물품 후원 설명</span>
                            <span className="col-span-2 text-white leading-normal">{selectedSpons.goods_desc}</span>
                          </div>
                        )}

                        {selectedSpons.goods_photo_url && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">물품 사진</span>
                            <div className="col-span-2">
                              <a href={selectedSpons.goods_photo_url} target="_blank" rel="noreferrer" className="block max-h-40 w-52 overflow-hidden border border-white/10 rounded-lg bg-zinc-950">
                                <img src={selectedSpons.goods_photo_url} alt="Goods Attached" className="object-cover w-full h-full hover:scale-105 transition-transform" />
                              </a>
                            </div>
                          </div>
                        )}

                        {selectedSpons.goods_valuation && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">물품 감정액</span>
                            <span className="col-span-2 text-[#ff3c00] font-mono font-bold">{selectedSpons.goods_valuation.toLocaleString()} 원</span>
                          </div>
                        )}

                        <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                          <span className="text-white/40 font-mono">기부자 연락처</span>
                          <span className="col-span-2 text-white font-bold">{selectedSpons.phone}</span>
                        </div>

                        {selectedSpons.fax && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">팩스 번호</span>
                            <span className="col-span-2 text-white">{selectedSpons.fax}</span>
                          </div>
                        )}

                        {selectedSpons.email && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">이메일 주소</span>
                            <span className="col-span-2 text-white font-mono">{selectedSpons.email}</span>
                          </div>
                        )}

                        {(selectedSpons.address || selectedSpons.address_detail) && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">우편 주소</span>
                            <span className="col-span-2 text-white leading-normal">
                              [{selectedSpons.zipcode}] {selectedSpons.address} {selectedSpons.address_detail} ({selectedSpons.address_type === "home" ? "자택" : "직장"})
                            </span>
                          </div>
                        )}

                        {/* CMS automatic account details */}
                        {selectedSpons.type === "regular" && selectedSpons.pay_method === "CMS" && (
                          <div className="bg-zinc-950/70 border border-white/5 p-4 rounded-xl space-y-2 mt-4">
                            <strong className="text-xs text-white block font-mono">🏦 CMS 자동이체 가입 정보</strong>
                            <div className="grid grid-cols-3 gap-y-1.5 text-[11px] font-mono text-white/50">
                              <div>은행명:</div>
                              <div className="col-span-2 text-white font-bold">{selectedSpons.bank_name}</div>
                              <div>계좌번호:</div>
                              <div className="col-span-2 text-white font-bold">{selectedSpons.bank_account}</div>
                              <div>예금주명:</div>
                              <div className="col-span-2 text-white font-sans font-bold">{selectedSpons.bank_holder}</div>
                              <div>예금주 생일:</div>
                              <div className="col-span-2 text-white font-bold">{selectedSpons.bank_birth}</div>
                              <div>자동 이체일:</div>
                              <div className="col-span-2 text-[#ff3c00] font-bold">{selectedSpons.pay_date}</div>
                            </div>
                          </div>
                        )}

                        {/* Tax Receipt details */}
                        {selectedSpons.receipt_opt !== "none" && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">소득공제 설정</span>
                            <span className="col-span-2 text-white font-bold">
                              {selectedSpons.receipt_opt === "personal" ? "개인소득공제용" : "사업자등록/단체용"} 
                              {selectedSpons.jumin_no && <span className="text-white/40 font-mono block text-[10px] mt-0.5 font-bold">식별번호: {selectedSpons.jumin_no}</span>}
                            </span>
                          </div>
                        )}

                        {selectedSpons.amount_desc && (
                          <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                            <span className="text-white/40 font-mono">전하고 싶은 말씀</span>
                            <span className="col-span-2 text-white/80 leading-normal font-sans italic">"{selectedSpons.amount_desc}"</span>
                          </div>
                        )}
                      </div>

                      {/* Display signatures */}
                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        {selectedSpons.signature_data && (
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] text-white/40 block font-mono">신청인(기부자) 서명:</span>
                            <div className="h-24 w-full bg-zinc-900 border border-white/10 flex items-center justify-center relative p-2 shadow-inner rounded-xl">
                              <img src={selectedSpons.signature_data} alt="Donor Signature" className="max-h-full max-w-full object-contain filter invert contrast-200" />
                            </div>
                          </div>
                        )}

                        {selectedSpons.holder_signature_data && (
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] text-white/40 block font-mono">예금주 출금동의 서명:</span>
                            <div className="h-24 w-full bg-zinc-900 border border-white/10 flex items-center justify-center relative p-2 shadow-inner rounded-xl">
                              <img src={selectedSpons.holder_signature_data} alt="Holder Signature" className="max-h-full max-w-full object-contain filter invert contrast-200" />
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-12 text-center text-white/30 min-h-[400px] flex flex-col justify-center items-center font-sans">
                      <span className="text-3xl block mb-2">👈</span>
                      <p className="text-xs leading-relaxed">왼쪽 목록에서 후원 신청자를 선택하시면 <br />상세 신청 문서와 디지털 서명 내역을 확인하실 수 있습니다.</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
