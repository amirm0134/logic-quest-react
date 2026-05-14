"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { Check, Lightbulb, LockKeyhole, Lock, RotateCcw, Terminal, X } from "lucide-react";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Sidebar } from "@/components/ui/modern-side-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/splite";
import { AlertBanner } from "@/components/ui/alert-banner";
import { cn } from "@/lib/utils";

const TRUE_MINTERMS = [1, 3, 4, 5, 6, 7, 8, 10, 12, 14];
const FORMULA_TERMS = ["A'D", "AD'", "BD'"];

function bits(index: number) {
  return [(index >> 3) & 1, (index >> 2) & 1, (index >> 1) & 1, index & 1];
}

function truth(index: number) {
  return TRUE_MINTERMS.includes(index) ? 1 : 0;
}

function sameNumbers(a: number[], b: number[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function useAudioSystem(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  function getContext() {
    if (typeof window === "undefined") return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!contextRef.current) {
      contextRef.current = new AudioContextClass();
    }
    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }
    return contextRef.current;
  }

  function tone(
    frequency: number,
    duration = 0.14,
    type: OscillatorType = "sine",
    volume = 0.26,
    delay = 0,
    force = false,
  ) {
    if (!enabled && !force) return;
    const context = getContext();
    if (!context) return;

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  return {
    unlock() {
      const context = getContext();
      if (context) void context.resume();
      tone(520, 0.08, "triangle", 0.2, 0, true);
      tone(760, 0.11, "sine", 0.17, 0.07, true);
    },
    click() {
      tone(420, 0.08, "triangle", 0.2);
      tone(640, 0.09, "sine", 0.16, 0.035);
    },
    select(on: boolean) {
      tone(on ? 660 : 300, 0.09, "triangle", 0.22);
    },
    hint() {
      tone(520, 0.08, "sine", 0.19);
      tone(780, 0.12, "sine", 0.16, 0.06);
    },
    error() {
      tone(180, 0.13, "sawtooth", 0.16);
      tone(150, 0.13, "sawtooth", 0.13, 0.08);
    },
    success() {
      tone(520, 0.09, "triangle", 0.22);
      tone(740, 0.11, "triangle", 0.2, 0.08);
      tone(980, 0.16, "sine", 0.17, 0.18);
    },
    robot() {
      tone(620, 0.07, "sine", 0.11);
      tone(930, 0.09, "triangle", 0.095, 0.06);
      tone(760, 0.16, "sine", 0.08, 0.16);
    },
  };
}

export default function SitoPage() {
  const router = useRouter();
  const [active, setActive] = useState("room");
  const [soundOn, setSoundOn] = useState(false);
  const [selectedMinterms, setSelectedMinterms] = useState<number[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [doorCode, setDoorCode] = useState("");
  const [status, setStatus] = useState(
    "La porta e' bloccata. Il terminale accetta solo una funzione logica coerente.",
  );
  const [doorOpen, setDoorOpen] = useState(false);
  const [stanzaCompleted, setStanzaCompleted] = useState(false);
  const [canonLocked, setCanonLocked] = useState(false);
  const [termsLocked, setTermsLocked] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    description: string;
  } | null>(null);
  const [robotHint, setRobotHint] = useState(
    "Benvenuto nella Stanza 01. Ricostruisci la funzione: forma canonica, gruppi K e codice della porta.",
  );
  const audio = useAudioSystem(soundOn);

  const mintermsOk = sameNumbers(
    selectedMinterms.slice().sort((a, b) => a - b),
    TRUE_MINTERMS,
  );

  const termsOk =
    selectedTerms.length === FORMULA_TERMS.length &&
    FORMULA_TERMS.every((term) => selectedTerms.includes(term));

  const rows = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        index,
        bits: bits(index).join(""),
        y: truth(index),
      })),
    [],
  );

  useEffect(() => {
    setStanzaCompleted(localStorage.getItem("logic-quest-stanza-01") === "complete");
  }, []);

  useEffect(() => {
    if (mintermsOk && !canonLocked) {
      setCanonLocked(true);
      notify("Forma canonica completata", "Hai sbloccato lo schema canonico negli archivi.");
    }
  }, [canonLocked, mintermsOk]);

  useEffect(() => {
    if (termsOk && !termsLocked) {
      setTermsLocked(true);
      notify("Mappa K completata", "Hai sbloccato lo schema semplificato negli archivi.");
    }
  }, [termsLocked, termsOk]);

  function toggleMinterm(index: number) {
    if (canonLocked || mintermsOk) return;
    audio.select(!selectedMinterms.includes(index));
    setSelectedMinterms((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index].sort((a, b) => a - b),
    );
  }

  function toggleTerm(term: string) {
    if (!mintermsOk || termsLocked || termsOk) return;
    audio.select(!selectedTerms.includes(term));
    setSelectedTerms((current) =>
      current.includes(term)
        ? current.filter((item) => item !== term)
        : current.length < 3
          ? [...current, term]
          : current,
    );
  }

  function verifyDoor() {
    if (!mintermsOk) {
      audio.error();
      setStatus("Il terminale rifiuta la sequenza: alcuni mintermini sono errati.");
      setRobotHint("Parti dalla forma canonica: devi accendere esattamente i casi in cui Y vale 1.");
      return;
    }
    if (!termsOk) {
      audio.error();
      setStatus("I gruppi K non sono stabili: manca un implicante essenziale.");
      setRobotHint("Cerca tre gruppi da quattro celle. In ogni gruppo resta solo cio' che non cambia.");
      return;
    }
    if (doorCode.trim() !== "103") {
      audio.error();
      setStatus("Codice errato. Indizio: 10 mintermini accesi, 0 variabili C, 3 gruppi.");
      setRobotHint("Il codice e' 10 / 0 / 3: dieci mintermini, zero C nella formula minima, tre termini finali.");
      return;
    }
    setDoorOpen(true);
    setStanzaCompleted(true);
    localStorage.setItem("logic-quest-stanza-01", "complete");
    audio.success();
    setStatus("Porta aperta. La funzione minima e' valida: Y = A'D + AD' + BD'.");
    setRobotHint("Porta aperta. Questa stanza era la base: nelle prossime useremo lo stesso ragionamento in modi diversi.");
    notify("Stanza 01 completata", "Percorso aggiornato: la Porta Karnaugh e' stata aperta.");
  }

  function resetRoom() {
    audio.click();
    setSelectedMinterms([]);
    setSelectedTerms([]);
    setDoorCode("");
    setDoorOpen(false);
    setCanonLocked(false);
    setTermsLocked(false);
    setToast(null);
    setStatus("Reset completato. Ricostruisci la funzione per aprire la porta.");
    setRobotHint("Reset completato. Riparti dai mintermini: la porta non accetta scorciatoie.");
  }

  const phase = doorOpen ? 4 : termsOk && mintermsOk ? 3 : mintermsOk ? 2 : 1;

  function notify(title: string, description: string) {
    audio.success();
    setToast({ id: Date.now(), title, description });
    window.setTimeout(() => {
      setToast((current) => (current?.title === title ? null : current));
    }, 5200);
  }

  useEffect(() => {
    if (!soundOn || active !== "room") return;

    const intervalId = window.setInterval(() => {
      audio.robot();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [active, audio, soundOn]);

  return (
    <BackgroundGradientAnimation>
      <main className="h-screen overflow-hidden">
        <Sidebar
          activeItem={active}
          soundOn={soundOn}
          onNavigate={(item) => {
            audio.click();
            setActive(item);
          }}
          onSoundToggle={() => {
            if (!soundOn) audio.unlock();
            setSoundOn((value) => !value);
          }}
          onBackHome={() => router.push("/")}
        />

        <section className="h-screen overflow-hidden px-3 py-3 md:pl-[20.5rem] md:pr-4">
          <div className="fixed right-5 top-5 z-[900] w-[min(440px,calc(100vw-2rem))]">
            <AnimatePresence>
              {toast && (
                <AlertBanner
                  key={toast.id}
                  variant="success"
                  title={toast.title}
                  description={toast.description}
                  onDismiss={() => setToast(null)}
                  secondaryAction={{
                    label: "Chiudi",
                    onClick: () => setToast(null),
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="mb-3 rounded-lg border border-white/10 bg-zinc-950/88 p-4 text-zinc-100 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-400">
                    Escape Room / Algebra Booleana
                  </p>
                  <h1 className="mt-1 text-3xl font-black leading-none text-white md:text-4xl">
                    Stanza 01: Porta Karnaugh
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Forma canonica", "Gruppi K", "Codice porta", "Uscita"].map((label, index) => (
                      <span
                        key={label}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          phase > index
                            ? "border-white/30 bg-white/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-500",
                        )}
                      >
                        {index + 1}. {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-semibold",
                    doorOpen
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/5 text-slate-200",
                  )}
                >
                  {status}
                </div>
              </div>
            </div>

            {active === "room" && (
              <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.18fr_0.82fr]">
                <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/88 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <Spotlight className="-top-56 left-10 opacity-40" fill="white" />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                          pannello della porta
                        </p>
                        <h2 className="mt-1 text-2xl font-black">Forma canonica</h2>
                      </div>
                      <Button
                        variant="outline"
                        onClick={resetRoom}
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                            fase 1
                          </p>
                          <h3 className="text-base font-black">Accendi i mintermini della forma canonica</h3>
                        </div>
                        <span className={cn("rounded-full px-3 py-1 text-xs font-bold", mintermsOk ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-slate-300")}>
                          {selectedMinterms.length}/10
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 16 }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => toggleMinterm(index)}
                          className={cn(
                            "rounded-lg border border-white/10 bg-black/35 p-2 text-center font-mono text-sm font-black text-slate-100 transition hover:bg-white/10",
                            (canonLocked || mintermsOk) && "cursor-not-allowed opacity-75",
                            selectedMinterms.includes(index) &&
                              "border-white/40 bg-white/[0.18] text-white shadow-lg shadow-white/10",
                          )}
                        >
                          m{index}
                          <span className="mt-1 block text-xs text-slate-500">
                            {bits(index).join("")}
                          </span>
                        </button>
                      ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                            fase 2
                          </p>
                          <h3 className="text-base font-black">Scegli gli implicanti essenziali</h3>
                        </div>
                        <span className={cn("rounded-full px-3 py-1 text-xs font-bold", termsOk ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-slate-300")}>
                          {selectedTerms.length}/3
                        </span>
                      </div>
                    <div className="grid grid-cols-3 gap-2">
                      {FORMULA_TERMS.concat(["A'C", "BC", "AB"]).map((term) => (
                        <button
                          key={term}
                          onClick={() => toggleTerm(term)}
                          className={cn(
                            "rounded-lg border border-white/10 bg-black/35 px-3 py-2 font-mono text-sm font-black text-slate-200 transition hover:bg-white/10",
                            (!mintermsOk || termsLocked || termsOk) &&
                              "cursor-not-allowed opacity-55 hover:bg-black/35",
                            selectedTerms.includes(term) &&
                              "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
                          )}
                        >
                          {term}
                        </button>
                      ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                      <div className="mb-2">
                        <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                          fase 3
                        </p>
                        <h3 className="text-base font-black">Inserisci il codice della porta</h3>
                      </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        value={doorCode}
                        onChange={(event) => setDoorCode(event.target.value)}
                        placeholder="Codice porta"
                        className="h-10 rounded-lg border border-white/10 bg-black/30 px-4 font-mono text-white outline-none ring-white/20 transition focus:ring-2"
                      />
                      <Button onClick={verifyDoor} className="h-10">
                        {doorOpen ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <LockKeyhole className="mr-2 h-4 w-4" />
                        )}
                        Apri porta
                      </Button>
                    </div>
                    </div>
                  </div>
                </Card>

                <RobotAssistant
                  hint={robotHint}
                  phase={phase}
                  onHint={(message) => {
                    audio.hint();
                    setRobotHint(message);
                  }}
                />
              </div>
            )}

            {active === "terminal" && (
              <div className="min-h-0 flex-1">
                <TerminalPanel
                  rows={rows}
                  mintermsOk={mintermsOk}
                  termsOk={termsOk}
                  doorOpen={doorOpen}
                />
              </div>
            )}

            {active === "archive" && (
              <div className="min-h-0 flex-1">
                <ArchivePanel
                  mintermsOk={mintermsOk}
                  termsOk={termsOk}
                  doorOpen={doorOpen}
                  stanzaCompleted={stanzaCompleted}
                />
              </div>
            )}

            {active === "roadmap" && (
              <div className="min-h-0 flex-1">
                <RoadmapPanel
                  mintermsOk={mintermsOk}
                  termsOk={termsOk}
                  doorOpen={doorOpen || stanzaCompleted}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </BackgroundGradientAnimation>
  );
}

function RobotAssistant({
  hint,
  phase,
  onHint,
}: {
  hint: string;
  phase: number;
  onHint: (message: string) => void;
}) {
  return (
    <Card className="relative h-full overflow-hidden border-white/10 bg-black/50 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
      <Spotlight className="-top-64 left-0 opacity-50 md:left-20" fill="white" />
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="h-full w-full"
          trackDocumentPointer
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/75 via-black/10 to-black/85" />
      <div className="relative z-20 flex h-full flex-col justify-between p-5">
        <div className="pointer-events-none">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
            assistente della stanza
          </p>
          <h2 className="mt-2 text-3xl font-black">Robot guida</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
            Rimane dentro la stanza e reagisce sull'intero pannello: chiedi un
            indizio quando il circuito si blocca.
          </p>
        </div>
        <div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm leading-6 text-slate-200 backdrop-blur-md">
            <div className="mb-2 flex items-center gap-2 font-bold text-white">
              <Lightbulb className="h-4 w-4" />
              Indizio fase {Math.min(phase, 3)}
            </div>
            {hint}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button
              onClick={() => onHint("La forma canonica e' la lista dei casi in cui Y=1. In questa stanza sono dieci.")}
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Canonica
            </button>
            <button
              onClick={() => onHint("I gruppi della mappa K eliminano C: restano A'D, AD' e BD'.")}
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Mappa K
            </button>
            <button
              onClick={() => onHint("Codice porta: 10 mintermini, 0 presenza di C nella formula minima, 3 termini finali.")}
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Codice
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TerminalPanel({
  rows,
  mintermsOk,
  termsOk,
  doorOpen,
}: {
  rows: { index: number; bits: string; y: number }[];
  mintermsOk: boolean;
  termsOk: boolean;
  doorOpen: boolean;
}) {
  return (
    <Card className="h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2 shadow-lg shadow-white/5">
            <Terminal className="h-5 w-5 text-slate-200" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              terminale logico
            </p>
            <h2 className="text-2xl font-black">Diagnostica della porta</h2>
          </div>
        </div>
        <div>
          <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 font-mono text-xs text-slate-300">
            SYS / KMAP / 01
          </div>
        </div>
      </div>
      <div className="grid h-[calc(100%-4rem)] gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-inner shadow-black/40">
          <table className="w-full border-collapse bg-black/30 text-center font-mono text-sm">
            <thead className="bg-black/55 text-slate-100">
              <tr>
                <th className="p-2">m</th>
                <th className="p-2">ABCD</th>
                <th className="p-2">Y</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.index}
                  className={cn(
                    "group transition duration-200 hover:bg-white/[0.12]",
                    row.y ? "bg-white/[0.07]" : "",
                  )}
                >
                  <td className="p-1.5 transition group-hover:text-white">m{row.index}</td>
                  <td className="p-1.5 text-slate-400 transition group-hover:text-slate-100">{row.bits}</td>
                  <td className="p-1.5">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-black transition group-hover:scale-110",
                        row.y
                          ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-100"
                          : "border-white/10 bg-white/[0.04] text-slate-400",
                      )}
                    >
                      {row.y}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3">
          <StatusBox label="Mintermini canonici" ok={mintermsOk} />
          <StatusBox label="Implicanti K" ok={termsOk} />
          <StatusBox label="Porta" ok={doorOpen} />
          <div className="group rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-sm text-slate-300 transition hover:border-white/25 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-white/5">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500 transition group-hover:text-slate-300">
              Codice indizio
            </div>
            <div className="mt-2 text-2xl font-black text-white transition group-hover:tracking-[0.12em]">
              10 / 0 / 3
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-500">
              mintermini / C eliminate / gruppi finali
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBox({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={cn(
        "group rounded-lg border p-4 font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-white/5",
        ok
          ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
          : "border-white/10 bg-white/[0.04] text-slate-300",
      )}
    >
      {label}: {ok ? "OK" : "in attesa"}
    </div>
  );
}

function ArchivePanel({
  mintermsOk,
  termsOk,
  doorOpen,
  stanzaCompleted,
}: {
  mintermsOk: boolean;
  termsOk: boolean;
  doorOpen: boolean;
  stanzaCompleted: boolean;
}) {
  const documents = [
    {
      title: "Schema Tinkercad",
      description: "Simulazione fisica del circuito con collegamenti su breadboard.",
      tag: "breadboard",
      src: "/assets/tinkercad-breadboard.webp",
      unlocked: true,
    },
    {
      title: "Schema canonico",
      description: "Circuito ottenuto direttamente dalla forma canonica.",
      tag: "canonico",
      src: "/assets/schema-canonico.webp",
      unlocked: mintermsOk || stanzaCompleted,
    },
    {
      title: "Schema semplificato",
      description: "Circuito ridotto dopo il ragionamento sulla mappa K.",
      tag: "minimo",
      src: "/assets/schema-semplificato.webp",
      unlocked: termsOk || stanzaCompleted,
    },
  ];
  const [openDocument, setOpenDocument] = useState<(typeof documents)[number] | null>(null);

  return (
    <>
    <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-72 left-32 opacity-30" fill="white" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
              dossier laboratorio
            </p>
            <h2 className="mt-1 text-2xl font-black">Archivio tecnico</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              Documenti sbloccati dalla Stanza 01.
            </p>
          </div>
          <div className="hidden rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-right font-mono md:block">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              funzione
            </div>
            <div className="mt-1 text-sm text-zinc-100">
              Y = SOMMA m(1,3,4,5,6,7,8,10,12,14)
            </div>
          </div>
        </div>

        <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/35 p-4 shadow-xl shadow-black/25 transition duration-200 hover:border-white/25 hover:bg-white/[0.05]">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/15" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                  file principale
                </p>
                <h3 className="mt-2 text-3xl font-black leading-none">
                  Dossier Stanza 01
                </h3>
              </div>

              <div className="my-5 rounded-lg border border-white/10 bg-zinc-950/70 p-4 font-mono">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  funzione sbloccata
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Y = A'D + AD' + BD'
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-500">
                  origine: SOMMA m(1,3,4,5,6,7,8,10,12,14)
                </div>
              </div>

              <div className="grid gap-2">
                {[
                  ["Breadboard disponibile", true],
                  ["Schema canonico", mintermsOk || stanzaCompleted],
                  ["Schema minimo", termsOk || stanzaCompleted],
                ].map(([item, ok]) => (
                  <div
                    key={String(item)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm transition group-hover:bg-white/[0.07]",
                      ok ? "bg-white/[0.04] text-zinc-200" : "bg-black/25 text-zinc-600",
                    )}
                  >
                    {ok ? (
                      <Check className="h-4 w-4 text-emerald-200" />
                    ) : (
                      <Lock className="h-4 w-4 text-zinc-600" />
                    )}
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid min-h-0 gap-3">
            {documents.map((document) => (
              <figure
                key={document.title}
                className={cn(
                  "group grid min-h-0 grid-cols-[170px_1fr] overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-xl shadow-black/25 transition duration-200",
                  document.unlocked
                    ? "hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.06] hover:shadow-white/10"
                    : "opacity-55",
                )}
              >
                <button
                  type="button"
                  onClick={() => document.unlocked && setOpenDocument(document)}
                  disabled={!document.unlocked}
                  className="group/image relative overflow-hidden text-left"
                  aria-label={`Apri ${document.title}`}
                >
                  <Image
                    src={document.src}
                    alt={document.title}
                    width={900}
                    height={600}
                    className={cn(
                      "h-full min-h-[132px] w-full object-cover opacity-75 saturate-[0.9] transition duration-300",
                      document.unlocked
                        ? "group-hover:scale-105 group-hover:opacity-100 group-hover:saturate-100"
                        : "grayscale",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
                  <div className="absolute inset-0 flex items-end justify-center bg-black/0 p-3 opacity-0 transition group-hover/image:bg-black/25 group-hover/image:opacity-100">
                    <span className="rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                      {document.unlocked ? "Apri" : "Bloccato"}
                    </span>
                  </div>
                </button>
                <figcaption className="relative flex flex-col justify-center p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 font-mono text-xs text-zinc-300">
                        {document.tag}
                      </span>
                      <div className="mt-3 text-lg font-black text-zinc-50">
                        {document.title}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        document.unlocked
                          ? "bg-emerald-300/10 text-emerald-100"
                          : "bg-white/[0.04] text-zinc-500",
                      )}
                    >
                      {document.unlocked ? "salvato" : "locked"}
                    </span>
                  </div>
                  <div className="mt-2 text-sm leading-5 text-zinc-400">
                    {document.description}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

    </Card>
    {openDocument && (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm"
        onClick={() => setOpenDocument(null)}
      >
        <div
          className="relative w-[min(1050px,calc(100vw-3rem))] overflow-hidden rounded-lg border border-white/15 bg-zinc-950 shadow-2xl shadow-black/60"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                {openDocument.tag}
              </div>
              <div className="text-lg font-black text-white">{openDocument.title}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpenDocument(null)}
              className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Chiudi immagine"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-black/40 p-4">
            <Image
              src={openDocument.src}
              alt={openDocument.title}
              width={1400}
              height={900}
              className="max-h-[72vh] w-full rounded-md object-contain"
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function RoadmapPanel({
  mintermsOk,
  termsOk,
  doorOpen,
}: {
  mintermsOk: boolean;
  termsOk: boolean;
  doorOpen: boolean;
}) {
  const progress = [mintermsOk, termsOk, doorOpen].filter(Boolean).length;

  return (
    <Card className="h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
        struttura del gioco
      </p>
      <div className="mt-1 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-black">Percorso livelli</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            La Stanza 01 e' il primo livello giocabile. Gli altri sono slot
            preparati per espandere il progetto senza cambiare struttura.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
            progresso stanza 01
          </div>
          <div className="mt-1 text-2xl font-black">{progress}/3</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div className="group relative overflow-hidden rounded-lg border border-white/20 bg-white/[0.08] p-4 shadow-xl shadow-black/25 transition duration-200 hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.12] hover:shadow-white/10">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/20" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
                  livello attivo
                </div>
                <div className="mt-2 text-2xl font-black text-white">Stanza 01</div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold",
                  doorOpen
                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                    : "border-white/15 bg-black/30 text-slate-300",
                )}
              >
                {doorOpen ? "completata" : "in corso"}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-300">Porta Karnaugh</div>
            <div className="mt-5 grid gap-2">
              {[
                ["Forma canonica", mintermsOk],
                ["Gruppi K", termsOk],
                ["Codice porta", doorOpen],
              ].map(([label, ok]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm transition group-hover:bg-black/35"
                >
                  <span className="text-slate-300">{label}</span>
                  <span className={ok ? "text-emerald-200" : "text-slate-500"}>
                    {ok ? "OK" : "locked"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {[
          ["Stanza 02", "Circuito guasto"],
          ["Stanza 03", "Mappa incompleta"],
          ["Stanza 04", "Tinkercad lab"],
        ].map(([title, subtitle]) => (
          <div
            key={title}
            className="group rounded-lg border border-white/10 bg-white/[0.04] p-4 transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-white/5"
          >
            <div className="text-lg font-black text-white">{title}</div>
            <div className="mt-1 text-sm text-slate-400">{subtitle}</div>
            <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-400 transition group-hover:bg-white/15 group-hover:text-slate-200">
              da definire
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
