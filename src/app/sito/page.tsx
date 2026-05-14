"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Lightbulb, LockKeyhole, RotateCcw, Terminal } from "lucide-react";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Sidebar } from "@/components/ui/modern-side-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/splite";
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
  const [robotHint, setRobotHint] = useState(
    "Benvenuto nella Stanza 01. Ricostruisci la funzione: forma canonica, gruppi K e codice della porta.",
  );

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

  function toggleMinterm(index: number) {
    setSelectedMinterms((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index].sort((a, b) => a - b),
    );
  }

  function toggleTerm(term: string) {
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
      setStatus("Il terminale rifiuta la sequenza: alcuni mintermini sono errati.");
      setRobotHint("Parti dalla forma canonica: devi accendere esattamente i casi in cui Y vale 1.");
      return;
    }
    if (!termsOk) {
      setStatus("I gruppi K non sono stabili: manca un implicante essenziale.");
      setRobotHint("Cerca tre gruppi da quattro celle. In ogni gruppo resta solo cio' che non cambia.");
      return;
    }
    if (doorCode.trim() !== "103") {
      setStatus("Codice errato. Indizio: 10 mintermini accesi, 0 variabili C, 3 gruppi.");
      setRobotHint("Il codice e' 10 / 0 / 3: dieci mintermini, zero C nella formula minima, tre termini finali.");
      return;
    }
    setDoorOpen(true);
    setStatus("Porta aperta. La funzione minima e' valida: Y = A'D + AD' + BD'.");
    setRobotHint("Porta aperta. Questa stanza era la base: nelle prossime useremo lo stesso ragionamento in modi diversi.");
  }

  function resetRoom() {
    setSelectedMinterms([]);
    setSelectedTerms([]);
    setDoorCode("");
    setDoorOpen(false);
    setStatus("Reset completato. Ricostruisci la funzione per aprire la porta.");
    setRobotHint("Reset completato. Riparti dai mintermini: la porta non accetta scorciatoie.");
  }

  const phase = doorOpen ? 4 : termsOk && mintermsOk ? 3 : mintermsOk ? 2 : 1;

  return (
    <BackgroundGradientAnimation>
      <main className="h-screen overflow-hidden">
        <Sidebar
          activeItem={active}
          soundOn={soundOn}
          onNavigate={setActive}
          onSoundToggle={() => setSoundOn((value) => !value)}
          onBackHome={() => router.push("/")}
        />

        <section className="h-screen overflow-hidden px-3 py-3 md:pl-[20.5rem] md:pr-4">
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="mb-3 rounded-lg border border-white/10 bg-slate-950/72 p-4 text-slate-100 shadow-2xl shadow-black/30 backdrop-blur-xl">
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
                <Card className="relative h-full overflow-hidden border-white/10 bg-slate-950/72 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
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
                            "rounded-lg border border-white/10 bg-white/[0.04] p-2 text-center font-mono text-sm font-black text-slate-100 transition hover:bg-white/10",
                            selectedMinterms.includes(index) &&
                              "border-white/40 bg-white/18 text-white shadow-lg shadow-white/10",
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
                            "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm font-black text-slate-200 transition hover:bg-white/10",
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
                  onHint={setRobotHint}
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
                <ArchivePanel />
              </div>
            )}

            {active === "roadmap" && (
              <div className="min-h-0 flex-1">
                <RoadmapPanel />
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
    <Card className="h-full overflow-hidden border-white/10 bg-slate-950/72 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-3">
        <Terminal className="h-6 w-6 text-slate-300" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
            terminale logico
          </p>
          <h2 className="text-2xl font-black">Diagnostica della porta</h2>
        </div>
      </div>
      <div className="grid h-[calc(100%-4rem)] gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full border-collapse text-center font-mono text-sm">
            <thead className="bg-white/[0.08] text-slate-200">
              <tr>
                <th className="p-2">m</th>
                <th className="p-2">ABCD</th>
                <th className="p-2">Y</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.index} className={row.y ? "bg-white/[0.04]" : ""}>
                  <td className="p-1.5">m{row.index}</td>
                  <td className="p-1.5 text-slate-400">{row.bits}</td>
                  <td className="p-1.5 font-black">{row.y}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3">
          <StatusBox label="Mintermini canonici" ok={mintermsOk} />
          <StatusBox label="Implicanti K" ok={termsOk} />
          <StatusBox label="Porta" ok={doorOpen} />
          <div className="rounded-lg border border-white/10 bg-black/25 p-4 font-mono text-sm text-slate-300">
            Codice indizio: <span className="text-white">10 / 0 / 3</span>
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
        "rounded-lg border p-4 font-semibold",
        ok
          ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
          : "border-white/10 bg-white/[0.04] text-slate-300",
      )}
    >
      {label}: {ok ? "OK" : "in attesa"}
    </div>
  );
}

function ArchivePanel() {
  return (
    <Card className="h-full overflow-hidden border-white/10 bg-slate-950/72 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <h2 className="text-2xl font-black">Archivio tecnico</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
        La stanza usa la funzione Y(A,B,C,D) = SOMMA m(1,3,4,5,6,7,8,10,12,14).
        La porta si apre solo quando la forma canonica e la forma semplificata
        coincidono.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {[
          ["Schema Tinkercad", "/assets/tinkercad-breadboard.webp"],
          ["Schema canonico", "/assets/schema-canonico.webp"],
          ["Schema semplificato", "/assets/schema-semplificato.webp"],
        ].map(([title, src]) => (
          <figure key={title} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <Image src={src} alt={title} width={900} height={600} className="h-[46vh] max-h-80 w-full object-cover" />
            <figcaption className="p-3 font-bold text-slate-100">{title}</figcaption>
          </figure>
        ))}
      </div>
    </Card>
  );
}

function RoadmapPanel() {
  return (
    <Card className="h-full overflow-hidden border-white/10 bg-slate-950/72 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
        struttura del gioco
      </p>
      <h2 className="mt-1 text-2xl font-black">Prossime stanze</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
        La Stanza 01 e' il primo livello. Le prossime missioni potranno usare
        gli stessi concetti in forme diverse: guasti nel circuito, verifica su
        breadboard, ricostruzione di una mappa K o confronto fra schema canonico
        e schema semplificato.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Stanza 02", "Circuito guasto"],
          ["Stanza 03", "Mappa incompleta"],
          ["Stanza 04", "Tinkercad lab"],
        ].map(([title, subtitle]) => (
          <div
            key={title}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="text-lg font-black text-white">{title}</div>
            <div className="mt-1 text-sm text-slate-400">{subtitle}</div>
            <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
              da definire
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
