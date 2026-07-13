"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-white shadow-lg max-w-sm mx-auto")}>
      <h1 className="text-2xl font-bold mb-2">Component Example</h1>
      <h2 className="text-xl font-semibold">{count}</h2>
      <div className="flex gap-2">
        <button 
          onClick={() => setCount((prev) => prev - 1)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors font-bold"
        >
          -
        </button>
        <button 
          onClick={() => setCount((prev) => prev + 1)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
};
