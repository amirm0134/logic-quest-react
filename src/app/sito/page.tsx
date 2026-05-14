"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sidebar } from "@/components/ui/modern-side-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRUE_MINTERMS = [1, 3, 4, 5, 6, 7, 8, 10, 12, 14];
const SCREENS = ["canon", "truth", "kmap", "simplify", "circuit", "sim", "media"];
const GROUPS = [
  { id: "ad", term: "Ā·D", cells: [1, 3, 5, 7], color: "blue" },
  { id: "and", term: "A·D̄", cells: [8, 10, 12, 14], color: "amber" },
  { id: "bd", term: "B·D̄", cells: [4, 6, 12, 14], color: "orange" },
];

function bits(index: number) {
  return [(index >> 3) & 1, (index >> 2) & 1, (index >> 1) & 1, index & 1];
}

function truth(index: number) {
  return TRUE_MINTERMS.includes(index) ? 1 : 0;
}

function kmapCells() {
  const ab = [0, 1, 3, 2];
  const cd = [0, 1, 3, 2];
  return cd.flatMap((cdValue) =>
    ab.map((abValue) => {
      const a = (abValue >> 1) & 1;
      const b = abValue & 1;
      const c = (cdValue >> 1) & 1;
      const d = cdValue & 1;
      return (a << 3) | (b << 2) | (c << 1) | d;
    }),
  );
}

export default function SitoPage() {
  const router = useRouter();
  const [active, setActive] = useState("canon");
  const [unlocked, setUnlocked] = useState(1);
  const [xp, setXp] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [canon, setCanon] = useState<number[]>([]);
  const [truthAnswers, setTruthAnswers] = useState<(0 | 1 | null)[]>(
    Array(16).fill(null),
  );
  const [kmap, setKmap] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [inputs, setInputs] = useState({ A: 0, B: 0, C: 0, D: 0 });
  const [message, setMessage] = useState("Scegli i mintermini accesi.");

  const index = (inputs.A << 3) | (inputs.B << 2) | (inputs.C << 1) | inputs.D;
  const output = truth(index);
  const activeTerms = {
    ad: !inputs.A && inputs.D,
    and: inputs.A && !inputs.D,
    bd: inputs.B && !inputs.D,
  };

  const orderedKmap = useMemo(() => kmapCells(), []);

  function reward(nextLevel: number, amount: number, msg: string) {
    setUnlocked((value) => Math.max(value, nextLevel));
    setXp((value) => value + amount);
    setMessage(msg);
    setActive(SCREENS[nextLevel - 1] ?? active);
  }

  function toggleNumber(list: number[], value: number, setter: (next: number[]) => void) {
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value].sort((a, b) => a - b),
    );
  }

  function sameAsTarget(values: number[]) {
    return (
      values.length === TRUE_MINTERMS.length &&
      values.every((value, index) => value === TRUE_MINTERMS[index])
    );
  }

  function checkCanon() {
    if (sameAsTarget(canon)) reward(2, 30, "Forma canonica corretta.");
    else setMessage("Controlla la lista: devono essere 10 mintermini.");
  }

  function checkTruth() {
    const ok = truthAnswers.every((value, index) => value === truth(index));
    if (ok) reward(3, 40, "Tabella di verità completata.");
    else setMessage("Ci sono righe da correggere nella tabella.");
  }

  function checkKmap() {
    if (sameAsTarget(kmap)) reward(4, 40, "Mappa K corretta.");
    else setMessage("Nella mappa K devono accendersi solo i mintermini della funzione.");
  }

  function checkSimplify() {
    const targetTerms = ["Ā·D", "A·D̄", "B·D̄"];
    const groupsOk = GROUPS.every((group) => selectedGroups.includes(group.id));
    const termsOk =
      terms.length === 3 && targetTerms.every((term) => terms.includes(term));
    if (groupsOk && termsOk) reward(5, 50, "Forma minima: Y = Ā·D + A·D̄ + B·D̄");
    else setMessage("Seleziona i 3 gruppi e i 3 termini corretti.");
  }

  const shell = "rounded-lg border border-slate-200 bg-white p-5 shadow-sm";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Sidebar
        activeItem={active}
        unlocked={unlocked}
        xp={xp}
        soundOn={soundOn}
        onNavigate={setActive}
        onSoundToggle={() => setSoundOn((value) => !value)}
        onBackHome={() => router.push("/")}
      />

      <section className="min-h-screen px-4 py-6 md:pl-[21rem] md:pr-6">
        <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white/80 p-5 shadow-2xl shadow-slate-300/40 backdrop-blur">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Y(A,B,C,D) = Σm(1,3,4,5,6,7,8,10,12,14)
              </p>
              <h1 className="mt-2 text-4xl font-black leading-none text-slate-950 md:text-5xl">
                Logic Quest
              </h1>
            </div>
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {message}
            </div>
          </div>

          {active === "canon" && (
            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className={shell}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-3xl font-black text-slate-950">Forma Canonica</h2>
                  <Button onClick={checkCanon}>Conferma</Button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 16 }, (_, item) => (
                    <button
                      key={item}
                      onClick={() => toggleNumber(canon, item, setCanon)}
                      className={cn(
                        "rounded-lg border border-slate-200 bg-white p-4 text-center font-mono font-black text-slate-950 transition",
                        canon.includes(item) &&
                          "border-blue-300 bg-blue-50 text-blue-700",
                      )}
                    >
                      m{item}
                      <span className="mt-1 block text-xs text-slate-500">
                        {bits(item).join("")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid place-items-center rounded-lg bg-slate-950 p-6 text-white">
                <div className="grid aspect-square w-64 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-500 text-5xl font-black shadow-2xl">
                  Σm
                </div>
              </div>
            </div>
          )}

          {active === "truth" && (
            <div className={shell}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-3xl font-black text-slate-950">Tabella di Verità</h2>
                <Button onClick={checkTruth}>Verifica</Button>
              </div>
              <div className="overflow-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse text-center font-mono">
                  <thead className="bg-slate-100 text-slate-900">
                    <tr>{["m", "A", "B", "C", "D", "Y"].map((cell) => <th key={cell} className="p-3">{cell}</th>)}</tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 16 }, (_, item) => (
                      <tr key={item} className={truth(item) ? "bg-emerald-50" : ""}>
                        <td className="p-2">m{item}</td>
                        {bits(item).map((bit, bitIndex) => (
                          <td key={bitIndex} className="p-2">{bit}</td>
                        ))}
                        <td className="space-x-2 p-2">
                          {[0, 1].map((value) => (
                            <button
                              key={value}
                              onClick={() =>
                                setTruthAnswers((current) =>
                                  current.map((entry, index) =>
                                    index === item ? (value as 0 | 1) : entry,
                                  ),
                                )
                              }
                              className={cn(
                                "h-9 w-9 rounded-md border border-slate-200 bg-white font-black",
                                truthAnswers[item] === value && "bg-blue-600 text-white",
                              )}
                            >
                              {value}
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {active === "kmap" && (
            <div className={shell}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-3xl font-black text-slate-950">Mappa K</h2>
                <Button onClick={checkKmap}>Verifica</Button>
              </div>
              <div className="grid grid-cols-4 gap-3 md:grid-cols-4">
                {orderedKmap.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleNumber(kmap, item, setKmap)}
                    className={cn(
                      "relative min-h-24 rounded-lg border border-slate-200 bg-white font-mono text-3xl font-black text-slate-900",
                      kmap.includes(item) && "border-emerald-300 bg-emerald-50 text-emerald-700",
                    )}
                  >
                    {kmap.includes(item) ? 1 : 0}
                    <span className="absolute bottom-2 right-2 text-xs text-slate-500">
                      m{item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {active === "simplify" && (
            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
              <div className={shell}>
                <h2 className="mb-4 text-3xl font-black text-slate-950">
                  Gruppi di Karnaugh
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {GROUPS.map((group) => (
                    <button
                      key={group.id}
                      onClick={() =>
                        setSelectedGroups((current) =>
                          current.includes(group.id)
                            ? current.filter((item) => item !== group.id)
                            : [...current, group.id],
                        )
                      }
                      className={cn(
                        "rounded-lg border border-slate-200 bg-white p-4 text-left font-mono font-black",
                        selectedGroups.includes(group.id) &&
                          "border-blue-300 bg-blue-50 text-blue-700",
                      )}
                    >
                      <span className="block text-sm text-slate-500">
                        {group.cells.map((cell) => `m${cell}`).join(" ")}
                      </span>
                      {group.term}
                    </button>
                  ))}
                </div>
              </div>
              <div className={shell}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-3xl font-black text-slate-950">Forma minima</h2>
                  <Button onClick={checkSimplify}>Conferma</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {["Ā·D", "A·D̄", "B·D̄", "Ā·C", "B·C", "A·B"].map((term) => (
                    <button
                      key={term}
                      onClick={() =>
                        setTerms((current) =>
                          current.includes(term)
                            ? current.filter((item) => item !== term)
                            : current.length < 3
                              ? [...current, term]
                              : current,
                        )
                      }
                      className={cn(
                        "rounded-lg border border-slate-200 px-4 py-3 font-mono font-black",
                        terms.includes(term) && "border-emerald-300 bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <div className="mt-5 rounded-lg bg-slate-100 p-5 font-mono text-3xl font-black text-slate-950">
                  Y = {terms.length ? terms.join(" + ") : "?"}
                </div>
              </div>
            </div>
          )}

          {active === "circuit" && (
            <div className={shell}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-3xl font-black text-slate-950">Circuiti</h2>
                <Button onClick={() => reward(6, 35, "Circuiti sbloccati.")}>
                  Sblocca simulatore
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  ["Tinkercad", "/assets/tinkercad-breadboard.webp"],
                  ["EasyEDA canonico", "/assets/schema-canonico.webp"],
                  ["EasyEDA semplificato", "/assets/schema-semplificato.webp"],
                ].map(([title, src]) => (
                  <figure key={title} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <Image src={src} alt={title} width={900} height={600} className="h-64 w-full object-cover" />
                    <figcaption className="p-3 font-bold text-slate-800">{title}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          {active === "sim" && (
            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className={shell}>
                <h2 className="mb-4 text-3xl font-black text-slate-950">Ingressi</h2>
                <div className="grid gap-3">
                  {(["A", "B", "C", "D"] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() =>
                        setInputs((current) => ({ ...current, [key]: current[key] ? 0 : 1 }))
                      }
                      className={cn(
                        "flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-4 font-black",
                        inputs[key] && "border-emerald-300 bg-emerald-50 text-emerald-700",
                      )}
                    >
                      {key}<span>{inputs[key]}</span>
                    </button>
                  ))}
                </div>
                <Button className="mt-4 w-full" onClick={() => reward(7, 30, "Simulatore completato.")}>
                  Completa
                </Button>
              </div>
              <div className="grid place-items-center rounded-lg bg-slate-950 p-8 text-white">
                <div className={cn("grid h-64 w-64 place-items-center rounded-full bg-slate-700 text-7xl font-black", output && "bg-emerald-500 shadow-[0_0_90px_rgba(16,185,129,.65)]")}>
                  {output}
                </div>
                <div className="mt-5 grid w-full gap-3 md:grid-cols-3">
                  {GROUPS.map((group) => (
                    <div key={group.id} className={cn("rounded-lg border border-white/10 bg-white/5 p-3 text-center font-mono font-black", activeTerms[group.id as keyof typeof activeTerms] && "bg-emerald-400 text-slate-950")}>
                      {group.term}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === "media" && (
            <div className={shell}>
              <h2 className="mb-4 text-3xl font-black text-slate-950">Multimedialità</h2>
              <div className="grid gap-3 md:grid-cols-4">
                {Array.from({ length: 16 }, (_, item) => (
                  <div
                    key={item}
                    className={cn(
                      "rounded-lg border border-slate-200 bg-white p-5 text-center font-mono font-black",
                      truth(item) && "border-blue-300 bg-blue-50 text-blue-700",
                    )}
                  >
                    m{item}
                    <span className="block text-xs text-slate-500">{bits(item).join("")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
