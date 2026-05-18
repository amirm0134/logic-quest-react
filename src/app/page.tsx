"use client";

import Link from "next/link";
import { CircuitBoard, RadioTower, ShieldCheck } from "lucide-react";

import { Boxes } from "@/components/ui/background-boxes";
import { StardustButton } from "@/components/ui/stardust-button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,rgba(8,8,10,0.45),rgba(8,8,10,0.95))]" />
      <Boxes />
      <div className="pointer-events-none absolute inset-0 z-20 bg-zinc-950/55 [mask-image:radial-gradient(transparent,white)]" />
      <div className="absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <section className="relative z-30 mx-auto grid w-[min(1100px,calc(100vw-2rem))] gap-8 px-4 text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-zinc-400 backdrop-blur-md">
          <RadioTower className="h-4 w-4 text-cyan-100" />
          laboratorio reti logiche
        </div>

        <div>
          <h1 className="mx-auto max-w-5xl text-6xl font-black leading-none tracking-[-0.03em] text-white md:text-8xl">
            Telecomunicazioni
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
            Un percorso interattivo tra forma canonica, mappe K, circuiti digitali
            e simulazione. Entra nel laboratorio e sblocca le stanze una alla volta.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl gap-3 md:grid-cols-3">
          {[
            ["Forma canonica", CircuitBoard],
            ["Circuito logico", RadioTower],
            ["Porta finale", ShieldCheck],
          ].map(([label, Icon]) => {
            const IconComponent = Icon as typeof CircuitBoard;
            return (
              <div
                key={String(label)}
                className={cn(
                  "group rounded-lg border border-white/10 bg-black/30 p-4 text-left backdrop-blur-md transition",
                  "hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-white/5",
                )}
              >
                <IconComponent className="h-5 w-5 text-zinc-300 transition group-hover:text-white" />
                <div className="mt-3 text-sm font-black text-white">{String(label)}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                  modulo attivo
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Link href="/sito" aria-label="Entra nel sito">
            <StardustButton>Entra</StardustButton>
          </Link>
        </div>
      </section>
    </main>
  );
}
