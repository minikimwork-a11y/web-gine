"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      onClose();
    }, 300);
  }, [onClose]);

  // Open/close management
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      // Lock body scroll
      document.body.style.overflow = "hidden";
    } else if (isVisible && !isClosing) {
      // Parent set isOpen=false directly — trigger close animation
      setIsClosing(true);
      document.body.style.overflow = "";
      setTimeout(() => {
        setIsClosing(false);
        setIsVisible(false);
      }, 300);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESC key
  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isVisible, close]);

  // Touch drag to close
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow drag from the handle area or when content is scrolled to top
    const contentEl = contentRef.current;
    if (contentEl && contentEl.scrollTop > 0) return;
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY < 0) return; // Don't drag upward
    dragCurrentY.current = deltaY;
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    if (sheetRef.current) {
      if (dragCurrentY.current > 120) {
        close();
      } else {
        sheetRef.current.style.transform = "translateY(0)";
      }
      dragCurrentY.current = 0;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          animation: isClosing
            ? "overlayFadeOut 0.3s ease-out forwards"
            : "overlayFadeIn 0.3s ease-out forwards",
        }}
        onClick={close}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] bg-[#0f0f0f] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col md:border-x"
        style={{
          maxHeight: "92vh",
          animation: isClosing
            ? "bottomSheetDown 0.3s ease-in forwards"
            : "bottomSheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 pb-3 border-b border-white/5">
          <h2 className="text-sm font-bold text-white/80 truncate pr-4 font-sans">
            {title || "상세 보기"}
          </h2>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            aria-label="닫기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 dark-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
