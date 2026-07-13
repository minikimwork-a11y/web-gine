import HalideLanding from "@/components/ui/demo";
import { Component as Counter } from "@/components/ui/halide-topo-hero";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      <HalideLanding />
      
      {/* Interactive Control Widget (Counter Component) */}
      <div className="fixed bottom-24 right-16 z-30 pointer-events-auto">
        <Counter />
      </div>
    </main>
  );
}

