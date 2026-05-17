"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lightbulb, LockKeyhole, Lock, RotateCcw, Terminal, X } from "lucide-react";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Sidebar } from "@/components/ui/modern-side-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/splite";
import { AlertBanner } from "@/components/ui/alert-banner";
import { SparklesText } from "@/components/ui/sparkles-text";
import { cn } from "@/lib/utils";

const TRUE_MINTERMS = [1, 3, 4, 5, 6, 7, 8, 10, 12, 14];
const FORMULA_TERMS = ["A'D", "AD'", "BD'"];
const CIRCUIT_CONNECTIONS = [
  { id: "a-and1", label: "A -> AND 1", from: "A_TAP_AND1", to: "AND1_A" },
  { id: "d-and1", label: "D -> AND 1", from: "D_TAP_AND1", to: "AND1_B" },
  { id: "b-and2", label: "B -> AND 2", from: "B_TAP_AND2", to: "AND2_A" },
  { id: "d-and2", label: "D -> AND 2", from: "D_TAP_AND2", to: "AND2_B" },
  { id: "a-and3", label: "A -> AND 3", from: "A_TAP_AND3", to: "AND3_A" },
  { id: "d-and3", label: "D -> AND 3", from: "D_TAP_AND3", to: "AND3_B" },
  { id: "and1-or1", label: "AND 1 -> OR 1", from: "AND1_OUT", to: "OR1_A" },
  { id: "and2-or1", label: "AND 2 -> OR 1", from: "AND2_OUT", to: "OR1_B" },
  { id: "or1-or2", label: "OR 1 -> OR finale", from: "OR1_OUT", to: "OR2_A" },
  { id: "and3-or2", label: "AND 3 -> OR finale", from: "AND3_OUT", to: "OR2_B" },
  { id: "or2-y", label: "OR finale -> Y", from: "OR2_OUT", to: "Y" },
];
const ROOM2_WIRES = CIRCUIT_CONNECTIONS;
const FIXED_WIRES: { from: string; to: string; color: string }[] = [];
const LEVELS = [
  { level: 1, id: "room", title: "Porta Karnaugh", topic: "Forma canonica, mappa K, codice finale" },
  { level: 2, id: "room2", title: "Circuito guasto", topic: "Tre AND, due OR e collaudo della funzione" },
  { level: 3, id: "room3", title: "Decodificatore K", topic: "Raggruppamenti in mappa di Karnaugh" },
  { level: 4, id: "room4", title: "Registro segnali", topic: "Tabella di verita' e mintermini" },
  { level: 5, id: "room5", title: "Centrale EasyEDA", topic: "Schema a porte logiche digitale" },
  { level: 6, id: "room6", title: "Simulatore fisico", topic: "Tinkercad, LED e uscita logica" },
  { level: 7, id: "room7", title: "Console feedback", topic: "Audio, feedback e percorso interattivo" },
  { level: 8, id: "room8", title: "Trasmettitore finale", topic: "Riepilogo completo e codice master" },
];

const BONUS_LEVELS = [
  {
    level: 3,
    title: "Decodificatore K",
    subtitle: "Leggi i blocchi: scegli la forma che mantiene solo cio' che non cambia.",
    answer: "A'D + AD' + BD'",
    options: ["A'C + BD + CD", "A'D + AD' + BD'", "AB + C'D + A'D'"],
  },
  {
    level: 4,
    title: "Registro segnali",
    subtitle: "Trova la riga giusta: i mintermini sono solo i casi in cui l'uscita e' attiva.",
    answer: "1,3,4,5,6,7,8,10,12,14",
    options: ["0,2,4,6,8,10,12,14", "1,2,3,7,9,11,13,15", "1,3,4,5,6,7,8,10,12,14"],
  },
  {
    level: 5,
    title: "Centrale EasyEDA",
    subtitle: "Riconosci la struttura dello schema senza farti distrarre dai componenti inutili.",
    answer: "NOT A, NOT D, tre AND, una OR",
    options: ["solo NAND in cascata", "NOT A, NOT D, tre AND, una OR", "due XOR e una NOT"],
  },
  {
    level: 6,
    title: "Simulatore fisico",
    subtitle: "Osserva la simulazione: il LED segue l'uscita logica, non un singolo ingresso.",
    answer: "LED acceso quando Y=1",
    options: ["LED sempre acceso", "LED acceso solo con C=1", "LED acceso quando Y=1"],
  },
  {
    level: 7,
    title: "Console feedback",
    subtitle: "Costruisci il ciclo dell'interazione: azione, risposta, avanzamento.",
    answer: "input -> feedback -> sblocco",
    options: ["testo -> pagina -> fine", "input -> feedback -> sblocco", "immagine -> audio -> reset"],
  },
  {
    level: 8,
    title: "Trasmettitore finale",
    subtitle: "La chiave finale combina cio' che hai gia' dimostrato nelle stanze precedenti.",
    answer: "103-3-8",
    options: ["108-2-4", "001-7-1", "103-3-8"],
  },
];

const SUPPORT_NOTES: Record<number, { terminal: string[]; archive: string[] }> = {
  2: {
    terminal: [
      "Collaudo utile: prova ingressi diversi prima di verificare.",
      "T1 e T3 sono copie della stessa condizione: A insieme a D.",
      "T2 deve dipendere da B e D: se usi C, il caso 0110 tradisce l'errore.",
      "L'uscita Y deve ricevere solo il risultato finale delle OR.",
    ],
    archive: [
      "Schema guida: linee verticali A B C D a sinistra, tre AND al centro, due OR verso Y.",
      "T2 non usa C: controlla che il secondo ingresso arrivi dalla verticale D.",
      "Collaudo anti-errore: con ABCD=0110 il risultato deve restare spento.",
    ],
  },
  3: {
    terminal: [
      "Una mappa K si legge per gruppi potenza di due.",
      "Dentro un gruppo resta solo cio' che non cambia.",
    ],
    archive: [
      "Documento K-1: gruppi da 1, 2, 4, 8 celle; gli angoli possono essere adiacenti.",
      "Documento K-2: una variabile resta nel termine solo se non cambia dentro tutto il gruppo.",
      "Documento K-3: una cella puo' aiutare piu' gruppi, se serve a coprire tutti gli 1.",
    ],
  },
  4: {
    terminal: ["La tabella serve a trasformare casi veri in mintermini.", "Y=1 significa riga da conservare."],
    archive: [
      "Registro T-1: l'indice del mintermine e' il valore binario di ABCD.",
      "Registro T-2: le righe con Y=0 non entrano nella somma canonica.",
      "Registro T-3: la lista finale va ordinata, altrimenti la console la rifiuta.",
    ],
  },
  5: {
    terminal: ["Uno schema EasyEDA deve avere ingressi, porte e uscita leggibili.", "Evita componenti che non cambiano la funzione."],
    archive: [
      "Schema E-1: prima semplifica, poi disegna il circuito.",
      "Schema E-2: ogni prodotto logico diventa una AND separata.",
      "Schema E-3: la OR finale raccoglie solo le uscite dei prodotti.",
    ],
  },
  6: {
    terminal: ["In Tinkercad il LED rappresenta l'uscita.", "Il circuito fisico deve seguire la stessa tabella logica."],
    archive: [
      "Banco F-1: alimentazione, resistenza e LED servono a visualizzare Y, non a cambiare la formula.",
      "Banco F-2: se Y vale 0 il LED non deve accendersi per magia.",
      "Banco F-3: la resistenza protegge il LED e non modifica la logica.",
    ],
  },
  7: {
    terminal: ["La multimedialita' deve dare feedback, non coprire il gioco.", "Ogni suono o animazione deve confermare un'azione."],
    archive: [
      "Modulo M-1: input chiaro, risposta immediata, avanzamento visibile.",
      "Modulo M-2: un suono conferma l'azione, non deve coprire l'indizio.",
      "Modulo M-3: ogni animazione deve rendere leggibile lo sblocco successivo.",
    ],
  },
  8: {
    terminal: ["La porta finale combina risultati gia' ottenuti.", "Non cercare un nuovo argomento: ricapitola il percorso."],
    archive: [
      "Sigillo finale: il codice master nasce dalle stanze completate.",
      "Chiave finale: combina codice della porta, numero stanze e uscita logica.",
      "Protocollo finale: nessuna stanza puo' restare non validata.",
    ],
  },
};

const LEVEL_PHASES: Record<number, string[]> = {
  3: ["Osserva le celle attive", "Forma tre gruppi validi", "Scegli la formula coerente"],
  4: ["Leggi le righe con Y=1", "Converti ABCD in indice", "Seleziona il set ordinato"],
  5: ["Identifica le negazioni", "Conta le porte necessarie", "Scegli la catena EasyEDA"],
  6: ["Collega uscita e LED", "Rispetta resistenza e alimentazione", "Prevedi il comportamento"],
  7: ["Azione dell'utente", "Feedback visivo/audio", "Sblocco del percorso"],
  8: ["Recupera i risultati", "Combina le chiavi", "Apri la porta finale"],
};

const LEVEL_STEP_OPTIONS: Record<
  number,
  { prompt: string; answer: string; options: string[] }[]
> = {
  3: [
    {
      prompt: "Quali celle puoi unire nella matrice?",
      answer: "celle adiacenti con Y=1",
      options: ["celle con lo stesso colore", "celle adiacenti con Y=1", "celle diagonali"],
    },
    {
      prompt: "Un gruppo valido deve contenere...",
      answer: "1, 2, 4 oppure 8 celle",
      options: ["3, 5 oppure 7 celle", "solo celle isolate", "1, 2, 4 oppure 8 celle"],
    },
    {
      prompt: "Nel termine finale restano solo...",
      answer: "le variabili che non cambiano",
      options: ["le variabili che non cambiano", "tutte le lettere ABCD", "la variabile C sempre"],
    },
  ],
  4: [
    {
      prompt: "Da una tabella di verita' prendi solo le righe con...",
      answer: "Y=1",
      options: ["Y=0", "ABCD dispari", "Y=1"],
    },
    {
      prompt: "Il numero del mintermine si ottiene leggendo ABCD come...",
      answer: "numero binario",
      options: ["numero decimale casuale", "numero binario", "codice Gray della riga"],
    },
    {
      prompt: "La lista finale deve essere...",
      answer: "ordinata crescente",
      options: ["ordinata crescente", "scritta al contrario", "senza virgole"],
    },
  ],
  5: [
    {
      prompt: "Prima dello schema EasyEDA devi decidere...",
      answer: "quali ingressi vanno negati",
      options: ["il colore dei fili", "quali ingressi vanno negati", "la dimensione della pagina"],
    },
    {
      prompt: "Ogni prodotto logico si realizza con...",
      answer: "una porta AND",
      options: ["una porta AND", "un LED", "un oscilloscopio"],
    },
    {
      prompt: "La somma dei prodotti arriva a...",
      answer: "una porta OR",
      options: ["un interruttore", "una porta OR", "una batteria"],
    },
  ],
  6: [
    {
      prompt: "Nel banco Tinkercad il LED rappresenta...",
      answer: "l'uscita Y",
      options: ["l'ingresso A", "l'uscita Y", "la massa"],
    },
    {
      prompt: "La resistenza serve a...",
      answer: "proteggere il LED",
      options: ["cambiare la formula", "proteggere il LED", "invertire D"],
    },
    {
      prompt: "Se il circuito logico produce 0, il LED deve...",
      answer: "restare spento",
      options: ["lampeggiare sempre", "restare spento", "accendersi comunque"],
    },
  ],
  7: [
    {
      prompt: "Un feedback utile deve arrivare...",
      answer: "subito dopo l'azione",
      options: ["solo alla fine", "subito dopo l'azione", "prima del clic"],
    },
    {
      prompt: "Audio e animazioni devono...",
      answer: "confermare il progresso",
      options: ["coprire gli indizi", "confermare il progresso", "nascondere i pulsanti"],
    },
    {
      prompt: "La progressione migliore e'...",
      answer: "azione, feedback, sblocco",
      options: ["azione, feedback, sblocco", "testo, pausa, reset", "audio, buio, caso"],
    },
  ],
  8: [
    {
      prompt: "La porta finale usa...",
      answer: "risultati gia' ottenuti",
      options: ["un numero inventato", "risultati gia' ottenuti", "solo la stanza 8"],
    },
    {
      prompt: "Il codice master deve combinare...",
      answer: "codice, livelli, uscita",
      options: ["codice, livelli, uscita", "colori, font, audio", "solo mintermini pari"],
    },
    {
      prompt: "Prima di aprire la porta finale serve...",
      answer: "tutte le stanze completate",
      options: ["solo un clic", "tutte le stanze completate", "saltare il terminale"],
    },
  ],
};

function bits(index: number) {
  return [(index >> 3) & 1, (index >> 2) & 1, (index >> 1) & 1, index & 1];
}

function truth(index: number) {
  return TRUE_MINTERMS.includes(index) ? 1 : 0;
}

function roomTwoTruth(key: string) {
  const [a, b, , d] = key.split("").map(Number);
  return (a && d) || (b && d) || (a && d) ? 1 : 0;
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
  const [currentRoom, setCurrentRoom] = useState(1);
  const [soundOn, setSoundOn] = useState(false);
  const [selectedMinterms, setSelectedMinterms] = useState<number[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [doorCode, setDoorCode] = useState("");
  const [status, setStatus] = useState(
    "La porta e' bloccata. Il terminale accetta solo una funzione logica coerente.",
  );
  const [doorOpen, setDoorOpen] = useState(false);
  const [stanzaCompleted, setStanzaCompleted] = useState(false);
  const [room2Completed, setRoom2Completed] = useState(false);
  const [room2JustUnlocked, setRoom2JustUnlocked] = useState(false);
  const [room2IntroStep, setRoom2IntroStep] = useState<number | null>(null);
  const [room2IntroSeen, setRoom2IntroSeen] = useState(false);
  const [placedWires, setPlacedWires] = useState<string[]>([]);
  const [selectedJack, setSelectedJack] = useState<string | null>(null);
  const [room2ProbeAnswers, setRoom2ProbeAnswers] = useState<Record<string, number>>({});
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [selectedBonusAnswers, setSelectedBonusAnswers] = useState<Record<number, string>>({});
  const [levelStepAnswers, setLevelStepAnswers] = useState<Record<number, string[]>>({});
  const [canonLocked, setCanonLocked] = useState(false);
  const [termsLocked, setTermsLocked] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    description: string;
    variant?: "success" | "warning";
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
    localStorage.removeItem("logic-quest-stanza-01");
    localStorage.removeItem("logic-quest-stanza-02");
    setStanzaCompleted(false);
    setRoom2Completed(false);
    setCompletedLevels([]);
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
      setStatus("Codice errato. Indizio: usa tre conteggi ricavati dalle fasi gia' completate.");
      setRobotHint("Il codice non si legge: si calcola. Conta i mintermini accesi, poi guarda cosa scompare nella formula minima e quanti blocchi restano.");
      return;
    }
    setDoorOpen(true);
    setStanzaCompleted(true);
    setCompletedLevels((current) => Array.from(new Set([...current, 1])));
    setRoom2JustUnlocked(true);
    audio.success();
    setStatus("Porta aperta. La funzione minima e' valida: Y = A'D + AD' + BD'.");
    setRobotHint("Porta aperta. Questa stanza era la base: nelle prossime useremo lo stesso ragionamento in modi diversi.");
    notify("Stanza 01 completata", "Percorso aggiornato: la Porta Karnaugh e' stata aperta.");
    window.setTimeout(() => setRoom2JustUnlocked(false), 4200);
  }

  function resetRoom() {
    audio.click();
    setSelectedMinterms([]);
    setSelectedTerms([]);
    setDoorCode("");
    setDoorOpen(false);
    setStanzaCompleted(false);
    setRoom2Completed(false);
    setCompletedLevels([]);
    setPlacedWires([]);
    setRoom2ProbeAnswers({});
    setSelectedBonusAnswers({});
    setLevelStepAnswers({});
    setCanonLocked(false);
    setTermsLocked(false);
    setToast(null);
    setStatus("Reset completato. Ricostruisci la funzione per aprire la porta.");
    setRobotHint("Reset completato. Riparti dai mintermini: la porta non accetta scorciatoie.");
  }

  const phase = doorOpen ? 4 : termsOk && mintermsOk ? 3 : mintermsOk ? 2 : 1;

  function notify(title: string, description: string, variant: "success" | "warning" = "success") {
    if (variant === "success") audio.success();
    else audio.error();
    setToast({ id: Date.now(), title, description, variant });
    window.setTimeout(() => {
      setToast((current) => (current?.title === title ? null : current));
    }, 5200);
  }

  function navigateLab(item: string) {
    audio.click();
    const targetLevel = LEVELS.find((level) => level.id === item)?.level;
    const unlockedLevels = getUnlockedLevels();
    if (targetLevel && !unlockedLevels.includes(targetLevel)) {
      notify(`Stanza ${String(targetLevel).padStart(2, "0")} bloccata`, "Completa prima la stanza precedente.", "warning");
      return;
    }
    if (item === "room") setCurrentRoom(1);
    if (item === "room2") {
      setCurrentRoom(2);
      if (!room2IntroSeen) {
        setRoom2IntroStep(0);
      }
    }
    if (targetLevel && targetLevel >= 3) {
      setCurrentRoom(targetLevel);
    }
    setActive(item);
  }

  function getUnlockedLevels() {
    const unlocked = [1];
    for (let level = 1; level < 8; level += 1) {
      const complete =
        level === 1
          ? stanzaCompleted || completedLevels.includes(1)
          : level === 2
            ? room2Completed || completedLevels.includes(2)
            : completedLevels.includes(level);
      if (complete) unlocked.push(level + 1);
      else break;
    }
    return Array.from(new Set(unlocked));
  }

  function advanceRoom2Intro() {
    if (room2IntroStep === null) return;
    if (room2IntroStep < 2) {
      setRoom2IntroStep((value) => (value === null ? null : value + 1));
      audio.click();
      return;
    }
    setRoom2IntroStep(null);
    setRoom2IntroSeen(true);
    audio.success();
  }

  function selectCircuitNode(point: string) {
    if (room2Completed) return;
    if (!selectedJack) {
      setSelectedJack(point);
      audio.select(true);
      return;
    }

    const wire = CIRCUIT_CONNECTIONS.find(
      (item) =>
        (item.from === selectedJack && item.to === point) ||
        (item.to === selectedJack && item.from === point),
    );

    if (!wire) {
      setSelectedJack(null);
      audio.error();
      notify("Collegamento errato", "Questi due nodi non appartengono alla stessa linea logica.", "warning");
      return;
    }

    setPlacedWires((current) =>
      current.includes(wire.id) ? current : [...current, wire.id],
    );
    setSelectedJack(null);
    audio.success();
  }

  function verifyRoom2() {
    const complete = CIRCUIT_CONNECTIONS.every((wire) => placedWires.includes(wire.id));
    if (!complete) {
      notify("Circuito incompleto", "Mancano ancora alcuni collegamenti tra porte logiche.", "warning");
      return;
    }
    const probesOk = ["1001", "0101", "0110"].every((key) => room2ProbeAnswers[key] === roomTwoTruth(key));
    if (!probesOk) {
      notify("Collaudo fallito", "Il cablaggio sembra completo, ma devi validare anche i tre casi di test.", "warning");
      return;
    }
    setRoom2Completed(true);
    setCompletedLevels((current) => Array.from(new Set([...current, 2])));
    notify("Stanza 02 completata", "Il circuito produce la stessa uscita della serratura.");
  }

  function completeBonusLevel(level: number) {
    const challenge = BONUS_LEVELS.find((item) => item.level === level);
    if (!challenge) return;
    const steps = LEVEL_STEP_OPTIONS[level] || [];
    const answers = levelStepAnswers[level] || [];
    const stepsOk = steps.every((step, index) => answers[index] === step.answer);
    if (!stepsOk) {
      notify("Obiettivi incompleti", "Completa tutte le verifiche della stanza prima della scelta finale.", "warning");
      return;
    }
    if (selectedBonusAnswers[level] !== challenge.answer) {
      notify("Sequenza errata", "La stanza resta chiusa: scegli la soluzione coerente con il percorso.", "warning");
      return;
    }
    setCompletedLevels((current) => Array.from(new Set([...current, level])));
    notify(`Stanza ${String(level).padStart(2, "0")} completata`, level === 8 ? "Porta finale aperta." : `Sbloccata la Stanza ${String(level + 1).padStart(2, "0")}.`);
  }

  function setLevelStep(level: number, index: number, answer: string) {
    audio.select(true);
    setLevelStepAnswers((current) => {
      const next = [...(current[level] || [])];
      next[index] = answer;
      return { ...current, [level]: next };
    });
  }

  const unlockedLevels = getUnlockedLevels();

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
          unlockedLevels={unlockedLevels}
          room2JustUnlocked={room2JustUnlocked}
          onNavigate={navigateLab}
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
                  variant={toast.variant || "success"}
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
                    Stanza {String(currentRoom).padStart(2, "0")}: {LEVELS.find((level) => level.level === currentRoom)?.title}
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
                          serratura della porta
                        </p>
                        <h2 className="mt-1 text-2xl font-black">Porta Karnaugh</h2>
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

            {active === "room2" && (
              <div className="min-h-0 flex-1">
                <LogicCircuitPanel
                  placedWires={placedWires}
                  completed={room2Completed}
                  selectedJack={selectedJack}
                  probeAnswers={room2ProbeAnswers}
                  onProbeAnswer={(key, value) =>
                    setRoom2ProbeAnswers((current) => ({ ...current, [key]: value }))
                  }
                  onSelectPoint={selectCircuitNode}
                  onVerify={verifyRoom2}
                />
              </div>
            )}

            {["room3", "room4", "room5", "room6", "room7", "room8"].includes(active) && (
              <div className="min-h-0 flex-1">
                {currentRoom === 8 && completedLevels.includes(8) ? (
                  <FinalVictoryPanel />
                ) : (
                  <BonusLevelPanel
                    level={currentRoom}
                    completed={completedLevels.includes(currentRoom)}
                    selectedAnswer={selectedBonusAnswers[currentRoom] || ""}
                    stepAnswers={levelStepAnswers[currentRoom] || []}
                    onSelectAnswer={(answer) =>
                      setSelectedBonusAnswers((current) => ({ ...current, [currentRoom]: answer }))
                    }
                    onStepAnswer={(index, answer) => setLevelStep(currentRoom, index, answer)}
                    onComplete={() => completeBonusLevel(currentRoom)}
                  />
                )}
              </div>
            )}

            <AnimatePresence>
              {active === "room2" && room2IntroStep !== null && (
                <RoomTwoIntro
                  step={room2IntroStep}
                  onAdvance={advanceRoom2Intro}
                />
              )}
            </AnimatePresence>

            {active === "terminal" && (
              <div className="min-h-0 flex-1">
                {currentRoom === 2 ? (
                  <RoomTwoTerminalPanel
                    placedWires={placedWires}
                    probeAnswers={room2ProbeAnswers}
                    completed={room2Completed}
                  />
                ) : currentRoom !== 1 ? (
                  <NoEvidencePanel label={`terminale stanza ${String(currentRoom).padStart(2, "0")}`} title="Terminale non necessario" />
                ) : (
                  <TerminalPanel
                    rows={rows}
                    mintermsOk={mintermsOk}
                    termsOk={termsOk}
                    doorOpen={doorOpen}
                  />
                )}
              </div>
            )}

            {active === "archive" && (
              <div className="min-h-0 flex-1">
                <ArchivePanel
                  mintermsOk={mintermsOk}
                  termsOk={termsOk}
                  doorOpen={doorOpen}
                  stanzaCompleted={stanzaCompleted}
                  currentRoom={currentRoom}
                />
              </div>
            )}

            {active === "roadmap" && (
              <div className="min-h-0 flex-1">
                <RoadmapPanel
                  mintermsOk={mintermsOk}
                  termsOk={termsOk}
                  doorOpen={doorOpen || stanzaCompleted}
                  room2Unlocked={stanzaCompleted}
                  room2Completed={room2Completed}
                  room2Progress={
                    placedWires.length +
                    ["1001", "0101", "0110"].filter(
                      (key) => room2ProbeAnswers[key] === roomTwoTruth(key),
                    ).length
                  }
                  room2Max={CIRCUIT_CONNECTIONS.length + 3}
                  completedLevels={completedLevels}
                  unlockedLevels={unlockedLevels}
                  onEnterRoom2={() => navigateLab("room2")}
                  onEnterLevel={(level) => navigateLab(LEVELS.find((item) => item.level === level)?.id || "roadmap")}
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
              onClick={() => onHint("Nella mappa K cerca gruppi da quattro celle: dentro ogni gruppo tieni solo le variabili che non cambiano. Una variabile sparisce in tutti i gruppi utili.")}
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Mappa K
            </button>
            <button
              onClick={() => onHint("Il codice ha tre cifre/logiche: numero di casi con Y=1, variabile eliminata dalla semplificazione, numero di blocchi finali.")}
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

function DoorLockVisual({
  mintermsOk,
  termsOk,
  doorOpen,
}: {
  mintermsOk: boolean;
  termsOk: boolean;
  doorOpen: boolean;
}) {
  const locks = [
    ["CAN", mintermsOk],
    ["KMP", termsOk],
    ["103", doorOpen],
  ] as const;

  return (
    <div className="mb-3 grid gap-3 rounded-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.28))] p-3 md:grid-cols-[1fr_210px]">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/40 p-3">
        <div className="absolute inset-x-8 top-0 h-px bg-white/50 shadow-[0_0_18px_rgba(255,255,255,0.85)]" />
        <div className="grid grid-cols-3 gap-2">
          {locks.map(([label, ok], index) => (
            <div
              key={label}
              className={cn(
                "relative overflow-hidden rounded-md border px-3 py-3 text-center font-mono text-xs font-black transition",
                ok
                  ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100 shadow-[0_0_20px_rgba(110,231,183,0.18)]"
                  : "border-white/10 bg-zinc-950 text-zinc-600",
              )}
            >
              <div className={cn("mx-auto mb-2 h-1 w-8 rounded-full", ok ? "bg-emerald-200" : "bg-zinc-700")} />
              {label}
              <span className="mt-1 block text-[10px] font-semibold text-zinc-500">
                sigillo {index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/45 p-3">
        <div className={cn("absolute inset-y-4 left-1/2 w-px -translate-x-1/2 transition", doorOpen ? "bg-emerald-200/70 shadow-[0_0_22px_rgba(110,231,183,0.8)]" : "bg-white/15")} />
        <div className="grid h-full grid-cols-2 gap-2">
          {[0, 1].map((side) => (
            <div
              key={side}
              className={cn(
                "rounded-md border border-white/10 bg-zinc-950/85 transition duration-700",
                doorOpen && (side === 0 ? "-translate-x-2 rotate-[-1deg]" : "translate-x-2 rotate-[1deg]"),
              )}
            >
              <div className="mx-auto mt-8 h-3 w-3 rounded-full bg-white/30" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          {doorOpen ? "varco aperto" : "serratura attiva"}
        </div>
      </div>
    </div>
  );
}

function RoomTwoIntro({
  step,
  onAdvance,
}: {
  step: number;
  onAdvance: () => void;
}) {
  const lines = [
    "La Porta Karnaugh si e' aperta, ma il laboratorio ha rilevato un sabotaggio nel circuito.",
    "Le porte AND e OR sono al loro posto: mancano solo le linee logiche giuste.",
    "Clicca un nodo e poi il nodo coerente. T2 usa B e D: il filo C qui e' una trappola.",
  ];
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTyped(lines[step].slice(0, index));
      if (index >= lines[step].length) {
        window.clearInterval(intervalId);
      }
    }, 24);

    return () => window.clearInterval(intervalId);
  }, [step]);

  return (
    <motion.div
      className="fixed inset-0 z-[950] cursor-pointer overflow-hidden bg-[linear-gradient(40deg,rgb(8,8,9),rgb(18,18,20))]"
      onClick={onAdvance}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="absolute inset-0 opacity-85 transition duration-500">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="h-full w-full"
          trackDocumentPointer
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/55 via-zinc-950/10 to-zinc-950/85" />
      <div className="absolute left-1/2 top-1/2 h-[72vh] w-[72vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-3xl" />
      <div className="absolute inset-x-0 bottom-10 mx-auto w-[min(860px,calc(100vw-2rem))] animate-introPanel rounded-lg border border-white/15 bg-zinc-950/72 p-6 text-white shadow-2xl shadow-black/70 backdrop-blur-xl">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
          messaggio assistente / {step + 1}/3
        </div>
        <div className="mt-3 min-h-[72px] text-2xl font-black leading-snug md:text-3xl">
          {typed}
          <span className="animate-pulse">_</span>
        </div>
        <div className="mt-4 text-sm text-zinc-500">Clicca per continuare</div>
      </div>
    </motion.div>
  );
}

function LogicCircuitPanel({
  placedWires,
  completed,
  selectedJack,
  probeAnswers,
  onProbeAnswer,
  onSelectPoint,
  onVerify,
}: {
  placedWires: string[];
  completed: boolean;
  selectedJack: string | null;
  probeAnswers: Record<string, number>;
  onProbeAnswer: (key: string, value: number) => void;
  onSelectPoint: (point: string) => void;
  onVerify: () => void;
}) {
  const nodes: Record<string, { x: number; y: number; label: string; kind?: "input" | "gate" | "output" }> = {
    A_TAP_AND1: { x: 58, y: 74, label: "A", kind: "input" },
    D_TAP_AND1: { x: 220, y: 114, label: "D", kind: "input" },
    B_TAP_AND2: { x: 112, y: 194, label: "B", kind: "input" },
    D_TAP_AND2: { x: 220, y: 234, label: "D", kind: "input" },
    A_TAP_AND3: { x: 58, y: 346, label: "A", kind: "input" },
    D_TAP_AND3: { x: 220, y: 386, label: "D", kind: "input" },
    AND1_A: { x: 430, y: 74, label: "1", kind: "gate" },
    AND1_B: { x: 430, y: 114, label: "2", kind: "gate" },
    AND1_OUT: { x: 535, y: 94, label: "T1", kind: "gate" },
    AND2_A: { x: 430, y: 194, label: "1", kind: "gate" },
    AND2_B: { x: 430, y: 234, label: "2", kind: "gate" },
    AND2_OUT: { x: 535, y: 214, label: "T2", kind: "gate" },
    AND3_A: { x: 430, y: 346, label: "1", kind: "gate" },
    AND3_B: { x: 430, y: 386, label: "2", kind: "gate" },
    AND3_OUT: { x: 535, y: 366, label: "T3", kind: "gate" },
    OR1_A: { x: 660, y: 154, label: "1", kind: "gate" },
    OR1_B: { x: 660, y: 194, label: "2", kind: "gate" },
    OR1_OUT: { x: 780, y: 174, label: "OR", kind: "gate" },
    OR2_A: { x: 835, y: 254, label: "1", kind: "gate" },
    OR2_B: { x: 835, y: 326, label: "2", kind: "gate" },
    OR2_OUT: { x: 925, y: 290, label: "out", kind: "gate" },
    Y: { x: 970, y: 290, label: "Y", kind: "output" },
  };

  const missingEndpoints = CIRCUIT_CONNECTIONS.flatMap((wire) =>
    placedWires.includes(wire.id) ? [] : [wire.from, wire.to],
  );
  const progress = Math.round((placedWires.length / CIRCUIT_CONNECTIONS.length) * 100);
  const endpointRole = (id: string) => {
    const wire = CIRCUIT_CONNECTIONS.find(
      (item) => !placedWires.includes(item.id) && (item.from === id || item.to === id),
    );
    if (!wire) return null;
    return wire.from === id ? "start" : "end";
  };
  const connectionPath = (from: string, to: string) => {
    const start = nodes[from];
    const end = nodes[to];
    const midX = Math.round((start.x + end.x) / 2);
    return `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`;
  };
  const renderConnection = (wire: (typeof CIRCUIT_CONNECTIONS)[number], active: boolean) => (
    <g key={`${active ? "active" : "ghost"}-${wire.id}`}>
      <path
        d={connectionPath(wire.from, wire.to)}
        fill="none"
        stroke={active ? "#a7f3d0" : "#ffffff"}
        strokeWidth={active ? 5.5 : 2}
        strokeLinecap="round"
        strokeDasharray={active ? undefined : "8 12"}
        opacity={active ? 0.95 : 0.16}
      />
      {active && (
        <circle r="4.5" fill="#ecfeff" opacity="0.95">
          <animateMotion dur="1.4s" repeatCount="indefinite" path={connectionPath(wire.from, wire.to)} />
        </circle>
      )}
    </g>
  );

  return (
    <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-64 left-20 opacity-30" fill="white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-55" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.045] blur-3xl" />
      <div className="relative z-10 flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">
              stanza 02 / circuito logico
            </p>
            <h2 className="mt-1 text-3xl font-black leading-none">
              Circuito guasto
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Ricostruisci le linee della forma minima. Verde parte, viola arriva.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-black/35 px-4 py-2 font-mono text-xs text-zinc-300">
              {placedWires.length}/{CIRCUIT_CONNECTIONS.length} linee
            </div>
            <Button onClick={onVerify}>
              <Check className="mr-2 h-4 w-4" />
              Verifica
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[1fr_280px]">
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/45 p-3 shadow-inner shadow-black/50">
            <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-emerald-200/10 blur-2xl" />
            <div className="absolute bottom-8 right-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
            <svg viewBox="0 0 1000 480" className="relative h-full w-full">
              <defs>
                <linearGradient id="gateFill" x1="0" x2="1">
                  <stop offset="0%" stopColor="#202124" />
                  <stop offset="100%" stopColor="#33343a" />
                </linearGradient>
              </defs>

              {[
                ["A", 58],
                ["B", 112],
                ["C", 166],
                ["D", 220],
              ].map(([label, x]) => (
                <g key={label}>
                  <text x={Number(x) - 10} y="35" fill="#fafafa" fontSize="30" fontWeight="950">{label}</text>
                  <line x1={Number(x)} y1="50" x2={Number(x)} y2="410" stroke="#d7d7d9" strokeWidth="2" opacity="0.78" />
                </g>
              ))}

              {[
                ["AND", 430, 94, "T1"],
                ["AND", 430, 214, "T2"],
                ["AND", 430, 366, "T3"],
              ].map(([name, x, y, label]) => (
                <g key={`${name}-${y}`}>
                  <path
                    d={`M ${Number(x)} ${Number(y) - 42} L ${Number(x) + 64} ${Number(y) - 42} Q ${Number(x) + 124} ${Number(y) - 42} ${Number(x) + 124} ${y} Q ${Number(x) + 124} ${Number(y) + 42} ${Number(x) + 64} ${Number(y) + 42} L ${Number(x)} ${Number(y) + 42} Z`}
                    fill="url(#gateFill)"
                    stroke="#8b8b8f"
                    strokeWidth="2"
                  />
                  <text x={Number(x) + 58} y={Number(y) + 6} textAnchor="middle" fill="#fafafa" fontSize="20" fontWeight="900">
                    {name}
                  </text>
                  <text x={Number(x) + 60} y={Number(y) + 66} textAnchor="middle" fill="#a1a1aa" fontSize="13" fontWeight="800">
                    {label}
                  </text>
                </g>
              ))}

              <path
                d="M 650 126 Q 730 146 772 174 Q 730 202 650 222 Q 696 174 650 126 Z"
                fill="url(#gateFill)"
                stroke="#8b8b8f"
                strokeWidth="2"
              />
              <path d="M 650 126 Q 690 174 650 222" fill="none" stroke="#8b8b8f" strokeWidth="2" />
              <text x="720" y="181" textAnchor="middle" fill="#fafafa" fontSize="18" fontWeight="900">OR</text>

              <path
                d="M 820 242 Q 890 260 925 290 Q 890 320 820 338 Q 862 290 820 242 Z"
                fill="url(#gateFill)"
                stroke="#8b8b8f"
                strokeWidth="2"
              />
              <path d="M 820 242 Q 855 290 820 338" fill="none" stroke="#8b8b8f" strokeWidth="2" />
              <text x="874" y="297" textAnchor="middle" fill="#fafafa" fontSize="18" fontWeight="900">OR</text>

              {CIRCUIT_CONNECTIONS.map((wire) => renderConnection(wire, placedWires.includes(wire.id)))}

              {Object.keys(nodes).map((id) => {
                const node = nodes[id];
                const selected = selectedJack === id;
                const target = missingEndpoints.includes(id);
                const role = endpointRole(id);
                const fill =
                  node.kind === "output"
                    ? "#fef3c7"
                    : role === "start"
                      ? "#86efac"
                      : role === "end"
                        ? "#d8b4fe"
                        : "#18181b";
                return (
                  <g key={id} className="cursor-pointer" onClick={() => onSelectPoint(id)}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={selected ? 13 : target ? 10 : 8}
                      fill={fill}
                      stroke={selected ? "#ffffff" : target ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.35)"}
                      strokeWidth={selected ? 4 : 2}
                      className={cn("transition", selected && "animate-pulse")}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={target ? 19 : 14}
                      fill="transparent"
                      stroke={selected ? "#ffffff" : "rgba(255,255,255,0.18)"}
                      strokeDasharray={target ? "4 6" : undefined}
                    />
                    <text x={node.x} y={node.y - 18} textAnchor="middle" fill="#f4f4f5" fontSize="12" fontWeight="900">
                      {node.label}
                    </text>
                  </g>
                );
              })}

              <line x1="925" y1="290" x2="970" y2="290" stroke="#d7d7d9" strokeWidth="2" />
              <text x="970" y="278" textAnchor="middle" fill="#fafafa" fontSize="34" fontWeight="950">Y</text>
              {completed && <circle cx="948" cy="290" r="7" fill="#86efac" className="animate-pulse" />}
            </svg>
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <div className="rounded-lg border border-white/10 bg-black/35 p-4">
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                uscita target
              </div>
              <div className="mt-2 text-2xl font-black">
                {completed ? "Y stabile" : "Y = ?"}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.65)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                collaudo finale
              </div>
              <div className="grid gap-2">
                {["1001", "0101", "0110"].map((key) => {
                  const expected = roomTwoTruth(key);
                  const chosen = probeAnswers[key];
                  return (
                    <div key={key} className="rounded-md border border-white/10 bg-white/[0.035] p-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-zinc-300">ABCD={key}</span>
                        <span className={chosen === expected ? "text-xs font-bold text-emerald-200" : "text-xs text-zinc-500"}>
                          {chosen === expected ? "OK" : "test"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[0, 1].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => onProbeAnswer(key, value)}
                            className={cn(
                              "rounded-md border px-2 py-1.5 font-mono text-xs font-black transition hover:bg-white/10",
                              chosen === value
                                ? "border-white/35 bg-white/15 text-white"
                                : "border-white/10 bg-black/20 text-zinc-500",
                            )}
                          >
                            Y={value}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                collegamenti richiesti
              </div>
              <div className="grid max-h-[calc(100%-1.5rem)] gap-1.5 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.28)_transparent]">
                {CIRCUIT_CONNECTIONS.map((wire) => {
                  const ok = placedWires.includes(wire.id);
                  return (
                    <div
                      key={wire.id}
                      className={cn(
                        "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs transition",
                        ok
                          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                          : "border-white/10 bg-white/[0.035] text-zinc-400",
                      )}
                    >
                      <span>{wire.label}</span>
                      <span className="font-mono">{ok ? "OK" : "--"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RoomTwoPanel({
  placedWires,
  completed,
  selectedJack,
  onSelectPoint,
  onVerify,
}: {
  placedWires: string[];
  completed: boolean;
  selectedJack: string | null;
  onSelectPoint: (point: string) => void;
  onVerify: () => void;
}) {
  const letters = "ABCDEFGHIJ".split("");
  const rows = Array.from({ length: 30 }, (_, index) => index + 1);
  const missingEndpoints = ROOM2_WIRES.flatMap((wire) =>
    placedWires.includes(wire.id) ? [] : [wire.from, wire.to],
  );
  const endpointRole = (id: string) => {
    const wire = ROOM2_WIRES.find(
      (item) => !placedWires.includes(item.id) && (item.from === id || item.to === id),
    );
    if (!wire) return null;
    return wire.from === id ? "start" : "end";
  };
  const jackPosition = (jack: string) => {
    const letter = jack[0];
    const row = Number(jack.slice(1));
    const yByLetter: Record<string, number> = {
      J: 96,
      I: 118,
      H: 140,
      G: 162,
      F: 184,
      E: 260,
      D: 282,
      C: 304,
      B: 326,
      A: 348,
    };
    return {
      x: 78 + (row - 1) * 29,
      y: yByLetter[letter],
    };
  };
  const renderWire = (
    id: string,
    from: string,
    to: string,
    color: string,
    active = true,
  ) => {
    const start = jackPosition(from);
    const end = jackPosition(to);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const sag = Math.min(34, Math.max(10, Math.sqrt(width * width + height * height) / 12));
    const controlY = Math.min(start.y, end.y) - sag;

    return (
      <path
        key={id}
        d={`M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${controlY} ${end.x} ${end.y}`}
        fill="none"
        stroke={color}
        strokeWidth={active ? 7 : 3}
        strokeLinecap="round"
        strokeDasharray={active ? undefined : "8 8"}
        opacity={active ? 1 : 0.45}
      />
    );
  };

  return (
    <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-64 left-20 opacity-25" fill="white" />
      <div className="relative z-10 flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">
              stanza 02 / laboratorio
            </p>
            <h2 className="mt-1 text-3xl font-black leading-none">
              Circuito guasto
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Seleziona un foro, poi un secondo foro: se la coppia e' corretta,
              compare il cavo verde mancante.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-black/35 px-4 py-2 font-mono text-xs text-zinc-300">
              {placedWires.length}/{ROOM2_WIRES.length} cavi verdi
            </div>
            <Button onClick={onVerify}>
              <Check className="mr-2 h-4 w-4" />
              Verifica circuito
            </Button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-[#e9e9e9] p-3 shadow-inner shadow-black/50">
          <svg viewBox="0 0 1000 520" className="h-full w-full">
            <rect x="208" y="52" width="704" height="402" rx="6" fill="#dfdfdf" stroke="#c8c8c8" />
            <rect x="208" y="52" width="704" height="66" fill="#eeeeee" opacity="0.9" />
            <rect x="208" y="395" width="704" height="59" fill="#eeeeee" opacity="0.9" />
            <rect x="208" y="232" width="704" height="8" fill="#cccccc" />
            <line x1="560" y1="52" x2="560" y2="454" stroke="#cfcfcf" strokeWidth="7" />

            <text x="220" y="105" fill="#ef4444" fontSize="18" fontWeight="700">+</text>
            <text x="898" y="105" fill="#ef4444" fontSize="18" fontWeight="700">+</text>
            <text x="220" y="425" fill="#ef4444" fontSize="18" fontWeight="700">+</text>
            <text x="898" y="425" fill="#ef4444" fontSize="18" fontWeight="700">+</text>
            <text x="222" y="155" fill="#333" fontSize="16">−</text>
            <text x="898" y="155" fill="#333" fontSize="16">−</text>
            <text x="222" y="385" fill="#333" fontSize="16">−</text>
            <text x="898" y="385" fill="#333" fontSize="16">−</text>

            {rows.map((row) => (
              <text key={`n-${row}`} x={jackPosition(`A${row}`).x - 5} y="392" fill="#333" fontSize="10" transform={`rotate(-90 ${jackPosition(`A${row}`).x - 5} 392)`}>
                {row}
              </text>
            ))}
            {["j", "i", "h", "g", "f"].map((label, index) => (
              <text key={label} x="224" y={96 + index * 22 + 4} fill="#333" fontSize="14">
                {label}
              </text>
            ))}
            {["e", "d", "c", "b", "a"].map((label, index) => (
              <text key={label} x="224" y={260 + index * 22 + 4} fill="#333" fontSize="14">
                {label}
              </text>
            ))}
            {["j", "i", "h", "g", "f"].map((label, index) => (
              <text key={`r-${label}`} x="890" y={96 + index * 22 + 4} fill="#333" fontSize="14">
                {label}
              </text>
            ))}
            {["e", "d", "c", "b", "a"].map((label, index) => (
              <text key={`r-${label}`} x="890" y={260 + index * 22 + 4} fill="#333" fontSize="14">
                {label}
              </text>
            ))}

            <line x1="255" y1="103" x2="840" y2="103" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
            <line x1="265" y1="188" x2="742" y2="188" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
            <line x1="285" y1="234" x2="772" y2="234" stroke="#facc15" strokeWidth="6" strokeLinecap="round" />
            <line x1="347" y1="307" x2="582" y2="307" stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round" />
            <line x1="255" y1="415" x2="842" y2="415" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

            {rows.flatMap((row) =>
              [70, 90, 424, 444].map((railY) => (
                <circle
                  key={`rail-${row}-${railY}`}
                  cx={jackPosition(`A${row}`).x}
                  cy={railY}
                  r="4.2"
                  fill="#1f1f1f"
                  stroke="#888"
                  strokeWidth="1.1"
                />
              )),
            )}

            {FIXED_WIRES.map((wire, index) =>
              renderWire(`fixed-${index}`, wire.from, wire.to, wire.color),
            )}
            {ROOM2_WIRES.filter((wire) => placedWires.includes(wire.id)).map((wire) =>
              renderWire(`green-${wire.id}`, wire.from, wire.to, "#22c55e", true),
            )}

            {rows.flatMap((row) =>
              letters.map((letter) => {
                const id = `${letter}${row}`;
                const selected = selectedJack === id;
                const target = missingEndpoints.includes(id);
                const role = endpointRole(id);
                const position = jackPosition(id);
                return (
                  <circle
                    key={id}
                    cx={position.x}
                    cy={position.y}
                    r={target || selected ? 6 : 4.2}
                    fill={selected ? "#f0abfc" : "#151515"}
                    stroke={role === "start" ? "#22c55e" : role === "end" ? "#a855f7" : "#777"}
                    strokeWidth={target || selected ? 2.4 : 1.2}
                    className="cursor-pointer transition hover:fill-emerald-200"
                    onClick={() => onSelectPoint(id)}
                  />
                );
              }),
            )}

            <rect x="306" y="206" width="86" height="70" rx="4" fill="#1487d4" stroke="#0f5f96" strokeWidth="2" />
            <text x="316" y="229" fill="white" fontSize="18" fontWeight="700">ON</text>
            {[0, 1, 2, 3].map((item) => (
              <g key={item}>
                <rect x={316 + item * 18} y="238" width="11" height="20" fill="#f8fafc" />
                <text x={316 + item * 18} y="270" fill="white" fontSize="12">{item + 1}</text>
              </g>
            ))}

            {[
              ["74HC04", 430, 212],
              ["74HC08", 565, 212],
              ["74HC32", 700, 212],
            ].map(([label, x, y]) => (
              <g key={label}>
                <rect x={Number(x)} y={Number(y)} width="135" height="54" rx="5" fill="#303030" />
                <text x={Number(x) + 36} y={Number(y) + 32} fill="#e5e5e5" fontSize="18" fontWeight="700">{label}</text>
                {[0, 1, 2, 3].map((pin) => (
                  <g key={pin}>
                    <circle cx={Number(x) + 15 + pin * 30} cy={Number(y) - 4} r="4" fill="#777" />
                    <circle cx={Number(x) + 15 + pin * 30} cy={Number(y) + 58} r="4" fill="#777" />
                  </g>
                ))}
              </g>
            ))}

            <g>
              <rect x="842" y="206" width="18" height="72" rx="8" fill="#c58b35" />
              <rect x="842" y="220" width="18" height="5" fill="#111" />
              <rect x="842" y="232" width="18" height="5" fill="#ef4444" />
              <rect x="842" y="244" width="18" height="5" fill="#111" />
              <line x1="851" y1="190" x2="851" y2="206" stroke="#777" strokeWidth="3" />
              <line x1="851" y1="278" x2="851" y2="316" stroke="#777" strokeWidth="3" />
              <rect x="828" y="316" width="40" height="58" rx="18" fill="#8f1d1d" stroke="#5f1515" strokeWidth="3" />
            </g>

            <line x1="848" y1="74" x2="848" y2="430" stroke="#333" strokeWidth="5" strokeLinecap="round" />
            <line x1="890" y1="72" x2="890" y2="430" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
            <circle cx="848" cy="84" r="8" fill="#6ee7b7" stroke="#111" strokeWidth="3" />

            {completed && (
              <g>
                <rect x="740" y="72" width="142" height="28" rx="14" fill="rgba(16,185,129,0.2)" stroke="rgba(110,231,183,0.7)" />
                <text x="760" y="91" fill="#065f46" fontSize="13" fontWeight="900">circuito stabile</text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </Card>
  );
}

function BonusLevelPanel({
  level,
  completed,
  selectedAnswer,
  stepAnswers,
  onSelectAnswer,
  onStepAnswer,
  onComplete,
}: {
  level: number;
  completed: boolean;
  selectedAnswer: string;
  stepAnswers: string[];
  onSelectAnswer: (answer: string) => void;
  onStepAnswer: (index: number, answer: string) => void;
  onComplete: () => void;
}) {
  const challenge = BONUS_LEVELS.find((item) => item.level === level) || BONUS_LEVELS[0];
  const next = level < 8 ? `Stanza ${String(level + 1).padStart(2, "0")}` : "Uscita finale";
  const steps = LEVEL_STEP_OPTIONS[level] || [];
  const stepCount = steps.filter((step, index) => stepAnswers[index] === step.answer).length;

  return (
    <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-72 left-28 opacity-30" fill="white" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.04)_45%,transparent_70%)]" />
      <div className="relative z-10 grid h-full gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="flex min-h-0 flex-col rounded-lg border border-white/10 bg-black/35 p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
              livello {String(level).padStart(2, "0")}
            </p>
            <h2 className="mt-2 text-4xl font-black leading-none">{challenge.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{challenge.subtitle}</p>
          </div>

          <div className="my-5 grid gap-3">
            {steps.map((step, index) => (
              <div key={step.prompt} className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2">
                <div
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs font-black",
                    stepAnswers[index] === step.answer
                      ? "border-emerald-200/35 bg-emerald-200/12 text-emerald-100"
                      : "border-white/10 bg-white/[0.04] text-zinc-500",
                  )}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-zinc-100">{LEVEL_PHASES[level]?.[index] || step.prompt}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                    {stepAnswers[index] === step.answer ? "validato" : "da risolvere"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-lg border border-white/10 bg-zinc-950/70 p-4">
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
              progresso stanza
            </div>
            <div className="mt-2 text-lg font-black text-white">
              {completed ? `${next} sbloccata` : `${stepCount}/${steps.length} verifiche superate`}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.55)] transition-all"
                style={{ width: `${steps.length ? (stepCount / steps.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3 overflow-hidden rounded-lg border border-white/10 bg-black/40 p-5">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full bg-emerald-200/10 blur-2xl" />
          <div className="min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.28)_transparent]">
            <LevelMission
              level={level}
              steps={steps}
              stepAnswers={stepAnswers}
              onStepAnswer={onStepAnswer}
            />
          </div>

          <div className="relative shrink-0 rounded-lg border border-white/10 bg-zinc-950/80 p-3">
            <div className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
              sigillo finale
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {challenge.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectAnswer(option)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border p-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.08]",
                    selectedAnswer === option
                      ? "border-white/45 bg-white/[0.12] text-white shadow-lg shadow-white/10"
                      : "border-white/10 bg-white/[0.035] text-zinc-300",
                  )}
                >
                  <span className="font-mono text-xs text-zinc-500">opzione {index + 1}</span>
                  <span className="mt-1 block truncate text-sm font-black md:text-base">{option}</span>
                    <span className="absolute inset-y-0 left-0 w-1 bg-white/0 transition group-hover:bg-white/40" />
                </button>
              ))}
            </div>
            <Button onClick={onComplete} className="mt-2 h-10 w-full">
              {completed ? <Check className="mr-2 h-4 w-4" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
              {completed ? "Completato" : "Conferma sequenza"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ChoiceChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-2 text-left text-xs font-bold transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.08]",
        active
          ? "border-white/40 bg-white/[0.14] text-white shadow-lg shadow-white/10"
          : "border-white/10 bg-black/30 text-zinc-400",
      )}
    >
      {label}
    </button>
  );
}

function LevelMission({
  level,
  steps,
  stepAnswers,
  onStepAnswer,
}: {
  level: number;
  steps: { prompt: string; answer: string; options: string[] }[];
  stepAnswers: string[];
  onStepAnswer: (index: number, answer: string) => void;
}) {
  const pick = (step: number, option: string) => onStepAnswer(step, option);

  if (level === 3) {
    const cells = [0, 1, 3, 2, 4, 5, 7, 6, 12, 13, 15, 14, 8, 9, 11, 10];
    return (
      <div className="relative grid min-h-0 gap-4 lg:grid-cols-[1fr_310px]">
        <div className="relative overflow-hidden rounded-lg border border-emerald-200/15 bg-zinc-950/70 p-4 shadow-[0_0_45px_rgba(16,185,129,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(16,185,129,0.18),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.12),transparent_36%)]" />
          <div className="absolute left-5 top-5 h-16 w-16 rounded-full border border-emerald-200/20" />
          <div className="absolute bottom-7 right-8 h-24 w-24 rounded-full border border-violet-200/15" />
          <div className="relative mb-3 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
            scanner k-map
          </div>
          <div className="relative grid h-[calc(100%-2rem)] grid-cols-4 gap-2">
            {cells.map((cell) => (
              <button
                key={cell}
                type="button"
                onClick={() => truth(cell) && pick(0, steps[0].answer)}
                className={cn(
                  "relative rounded-lg border font-mono text-sm font-black transition hover:scale-[1.03]",
                  truth(cell)
                    ? "border-emerald-200/35 bg-emerald-200/12 text-emerald-50 shadow-[0_0_20px_rgba(167,243,208,0.14)]"
                    : "border-white/10 bg-white/[0.025] text-zinc-600",
                )}
              >
                m{cell}
                {truth(cell) ? <span className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-white/60" /> : null}
              </button>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-3 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.28)_transparent]">
          {steps.map((step, index) => (
            <div key={step.prompt} className="rounded-lg border border-white/10 bg-black/35 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                regola {index + 1}
              </div>
              <div className="mt-1 text-sm font-black text-white">{step.prompt}</div>
              <div className="mt-2 grid gap-1.5">
                {step.options.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={option}
                    active={stepAnswers[index] === option}
                    onClick={() => pick(index, option)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (level === 4) {
    return (
      <div className="grid min-h-0 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="min-h-[430px] overflow-hidden rounded-lg border border-cyan-200/15 bg-black/35 shadow-[0_0_45px_rgba(34,211,238,0.08)]">
          <div className="grid grid-cols-4 border-b border-cyan-200/10 bg-cyan-200/[0.06] p-2 font-mono text-xs text-zinc-300">
            <span>m</span><span>ABCD</span><span>Y</span><span>azione</span>
          </div>
          <div className="grid max-h-[385px] gap-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.28)_transparent]">
            {Array.from({ length: 16 }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => truth(index) && pick(0, steps[0].answer)}
                className={cn(
                  "grid grid-cols-4 items-center border-b border-white/5 px-2 py-1.5 text-left font-mono text-xs transition hover:bg-cyan-200/[0.08]",
                  truth(index) ? "bg-cyan-200/[0.07] text-zinc-100" : "text-zinc-600",
                )}
              >
                <span>m{index}</span>
                <span>{bits(index).join("")}</span>
                <span>{truth(index)}</span>
                <span>{truth(index) ? "conserva" : "scarta"}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-3">
          <div className="rounded-lg border border-cyan-200/15 bg-zinc-950/70 p-4">
            <div className="text-3xl font-black text-white">Sigma m</div>
            <div className="mt-2 font-mono text-sm text-zinc-400">costruisci la lista senza righe false</div>
          </div>
          {steps.map((step, index) => (
            <div key={step.prompt} className="grid gap-2 rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="text-sm font-black text-white">{step.prompt}</div>
              <div className="grid gap-1.5">
                {step.options.map((option) => (
                  <ChoiceChip key={option} label={option} active={stepAnswers[index] === option} onClick={() => pick(index, option)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (level === 5) {
    const modules = ["Ingressi", "Negazioni", "AND", "OR", "Y"];
    return (
      <div className="grid min-h-0 grid-rows-[1fr_auto] gap-4">
        <div className="relative overflow-hidden rounded-lg border border-sky-200/15 bg-zinc-950/70 p-5 shadow-[0_0_45px_rgba(56,189,248,0.08)]">
          <div className="absolute inset-x-10 top-1/2 h-1 rounded-full bg-gradient-to-r from-sky-300/20 via-fuchsia-200/35 to-emerald-200/20" />
          <div className="absolute left-12 top-8 font-mono text-[10px] uppercase tracking-[0.28em] text-sky-200/45">schema bus</div>
          <div className="relative grid h-full grid-cols-5 items-center gap-3">
            {modules.map((module, index) => (
              <button
                key={module}
                type="button"
                onClick={() => index === 1 ? pick(0, steps[0].answer) : index === 2 ? pick(1, steps[1].answer) : index === 3 ? pick(2, steps[2].answer) : undefined}
                className="group rounded-lg border border-white/10 bg-black/45 p-4 text-center transition hover:-translate-y-2 hover:border-sky-200/35 hover:bg-sky-200/[0.08]"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">slot {index + 1}</div>
                <div className="mt-2 text-xl font-black text-white">{module}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.prompt} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="mb-2 text-sm font-black text-white">{step.prompt}</div>
              <div className="grid gap-1.5">
                {step.options.map((option) => (
                  <ChoiceChip key={option} label={option} active={stepAnswers[index] === option} onClick={() => pick(index, option)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (level === 6) {
    return (
      <div className="grid min-h-0 gap-4 lg:grid-cols-[1fr_310px]">
        <div className="relative overflow-hidden rounded-lg border border-amber-200/15 bg-zinc-950/70 p-5 shadow-[0_0_45px_rgba(251,191,36,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(248,113,113,0.16),transparent_34%),radial-gradient(circle_at_28%_72%,rgba(251,191,36,0.12),transparent_36%)]" />
          <div className="absolute left-8 top-10 h-24 w-36 rounded-lg border border-white/15 bg-white/[0.06]" />
          <div className="absolute right-16 top-12 h-20 w-20 animate-pulse rounded-full border border-red-200/35 bg-red-400/15 shadow-[0_0_45px_rgba(248,113,113,0.28)]" />
          <div className="absolute bottom-16 left-16 right-24 h-1 rounded-full bg-gradient-to-r from-amber-200/30 via-white/25 to-red-200/30" />
          <div className="absolute bottom-24 left-28 h-14 w-9 rounded bg-amber-300/35" />
          <div className="absolute bottom-10 right-12 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">simulatore fisico</div>
        </div>
        <div className="grid content-start gap-3">
          {steps.map((step, index) => (
            <div key={step.prompt} className="rounded-lg border border-white/10 bg-black/35 p-3">
              <div className="mb-2 text-sm font-black text-white">{step.prompt}</div>
              <div className="grid grid-cols-1 gap-1.5">
                {step.options.map((option) => (
                  <ChoiceChip key={option} label={option} active={stepAnswers[index] === option} onClick={() => pick(index, option)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (level === 7) {
    return (
      <div className="grid min-h-0 gap-4">
        <div className="grid grid-cols-3 gap-3">
          {["azione", "feedback", "sblocco"].map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => pick(index, steps[index].answer)}
              className="relative min-h-40 overflow-hidden rounded-lg border border-fuchsia-200/15 bg-white/[0.05] p-4 text-left transition hover:-translate-y-1 hover:border-fuchsia-200/35 hover:bg-fuchsia-200/[0.08]"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-fuchsia-300/15 blur-2xl" />
              <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
              <div className="relative font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">nodo {index + 1}</div>
              <div className="relative mt-3 text-2xl font-black uppercase tracking-[0.12em] text-white">{item}</div>
              <div className="relative mt-4 h-1 rounded-full bg-white/20">
                <div className={cn("h-full rounded-full bg-white transition-all", stepAnswers[index] === steps[index].answer ? "w-full" : "w-1/4")} />
              </div>
            </button>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.prompt} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="mb-2 text-sm font-black text-white">{step.prompt}</div>
              <div className="grid gap-1.5">
                {step.options.map((option) => (
                  <ChoiceChip key={option} label={option} active={stepAnswers[index] === option} onClick={() => pick(index, option)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative grid place-items-center overflow-hidden rounded-lg border border-violet-200/15 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),rgba(0,0,0,0.35))] shadow-[0_0_55px_rgba(168,85,247,0.1)]">
        <div className="absolute inset-12 rounded-full border border-white/10" />
        <div className="absolute inset-24 rounded-full border border-fuchsia-200/10" />
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">serratura master</div>
          <div className="mt-3 text-6xl font-black tracking-[0.2em] text-white">103</div>
          <div className="mt-2 font-mono text-sm text-zinc-500">3 blocchi / 8 stanze</div>
        </div>
      </div>
      <div className="grid content-start gap-3">
        {steps.map((step, index) => (
          <div key={step.prompt} className="rounded-lg border border-white/10 bg-black/35 p-3">
            <div className="mb-2 text-sm font-black text-white">{step.prompt}</div>
            <div className="grid gap-1.5">
              {step.options.map((option) => (
                <ChoiceChip key={option} label={option} active={stepAnswers[index] === option} onClick={() => pick(index, option)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LevelWorkbench({ level }: { level: number }) {
  if (level === 3) {
    const cells = [0, 1, 3, 2, 4, 5, 7, 6, 12, 13, 15, 14, 8, 9, 11, 10];
    return (
      <div className="grid h-full grid-cols-4 gap-2">
        {cells.map((cell) => (
          <div
            key={cell}
            className={cn(
              "relative flex items-center justify-center rounded-lg border font-mono text-sm font-black",
              truth(cell) ? "border-white/35 bg-white/[0.12] text-white" : "border-white/10 bg-white/[0.025] text-zinc-600",
            )}
          >
            m{cell}
            {truth(cell) ? <span className="absolute bottom-2 h-1 w-8 rounded-full bg-white/60" /> : null}
          </div>
        ))}
      </div>
    );
  }

  if (level === 4) {
    return (
      <div className="grid h-full grid-cols-4 gap-2">
        {Array.from({ length: 16 }, (_, index) => (
          <div key={index} className="rounded-lg border border-white/10 bg-zinc-950/70 p-3 font-mono text-xs">
            <div className="text-zinc-500">m{index}</div>
            <div className="mt-1 text-lg font-black text-white">{bits(index).join("")}</div>
            <div className={truth(index) ? "text-emerald-200" : "text-zinc-600"}>Y={truth(index)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (level === 5) {
    return (
      <div className="grid h-full grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 font-mono">
        {["IN", "NOT", "AND", "OR", "Y"].map((item, index) => (
          <div key={item} className="rounded-lg border border-white/10 bg-white/[0.05] p-5 text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">modulo {index + 1}</div>
            <div className="mt-2 text-2xl font-black text-white">{item}</div>
          </div>
        ))}
      </div>
    );
  }

  if (level === 6) {
    return (
      <div className="relative h-full rounded-lg border border-white/10 bg-zinc-950/70 p-5">
        <div className="absolute left-8 top-10 h-24 w-36 rounded-lg border border-white/15 bg-white/[0.06]" />
        <div className="absolute right-16 top-12 h-16 w-16 rounded-full border border-red-300/40 bg-red-400/10 shadow-[0_0_35px_rgba(248,113,113,0.22)]" />
        <div className="absolute bottom-12 left-16 right-20 h-1 rounded-full bg-white/25" />
        <div className="absolute bottom-20 left-24 h-12 w-8 rounded bg-amber-300/40" />
      </div>
    );
  }

  if (level === 7) {
    return (
      <div className="grid h-full grid-cols-3 gap-3">
        {["azione", "feedback", "sblocco"].map((item, index) => (
          <div key={item} className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-xl font-black uppercase tracking-[0.16em] text-white">
            {index + 1}. {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-full place-items-center rounded-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(0,0,0,0.35))]">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">porta finale</div>
        <div className="mt-3 text-6xl font-black tracking-[0.2em] text-white">???</div>
      </div>
    </div>
  );
}

function FinalVictoryPanel() {
  return (
    <Card className="relative grid h-full place-items-center overflow-hidden border-white/10 bg-zinc-950/95 p-6 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
      <Spotlight className="-top-80 left-1/2 opacity-30" fill="white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px] opacity-45" />
      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.08] blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-4xl text-center"
      >
        <div className="font-mono text-xs uppercase tracking-[0.35em] text-zinc-500">
          protocollo completato
        </div>
        <SparklesText
          text="Porta Finale Aperta"
          sparklesCount={30}
          colors={{ first: "#9E7AFF", second: "#FE8BBB" }}
          className="mt-6 text-5xl font-black leading-tight text-white md:text-7xl"
        />
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400">
          Hai ricostruito forma canonica, mappa K, circuito logico, simulazione
          e percorso multimediale. Il laboratorio di telecomunicazioni riconosce la funzione e libera
          l'uscita.
        </p>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 md:grid-cols-3">
          {[
            ["Forma canonica", "border-cyan-200/20 bg-cyan-200/[0.06]"],
            ["Circuito", "border-fuchsia-200/20 bg-fuchsia-200/[0.06]"],
            ["Codice master", "border-emerald-200/20 bg-emerald-200/[0.06]"],
          ].map(([item, style]) => (
            <div key={item} className={cn("rounded-lg border p-4", style)}>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">validato</div>
              <div className="mt-2 text-sm font-black text-white">{item}</div>
            </div>
          ))}
        </div>
      </motion.div>
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
  const activeMinterms = rows.filter((row) => row.y === 1).map((row) => row.index);
  const terminalLines = [
    ["CANONICA", mintermsOk ? "OK" : `${activeMinterms.length} mintermini da ricostruire`],
    ["K-MAP", termsOk ? "A'D + AD' + BD'" : "implicanti non confermati"],
    ["CODICE", doorOpen ? "codice accettato" : "calcola dai tre conteggi"],
  ];

  return (
    <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-72 left-20 opacity-20" fill="white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:36px_36px] opacity-50" />
      <div className="relative z-10 h-full">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2 shadow-lg shadow-white/5">
            <Terminal className="h-5 w-5 text-slate-200" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              terminale logico
            </p>
            <h2 className="text-xl font-black">Diagnostica della porta</h2>
          </div>
        </div>
        <div>
          <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 font-mono text-xs text-slate-300">
            SYS / KMAP / 01
          </div>
        </div>
      </div>
      <div className="grid h-[calc(100%-3.4rem)] gap-3 lg:grid-cols-[1fr_330px]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20 shadow-inner shadow-black/40">
          <table className="w-full border-collapse bg-black/30 text-center font-mono text-sm">
            <thead className="bg-black/55 text-slate-100">
              <tr>
                <th className="p-1.5">m</th>
                <th className="p-1.5">ABCD</th>
                <th className="p-1.5">Y</th>
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
                  <td className="p-1 transition group-hover:text-white">m{row.index}</td>
                  <td className="p-1 text-slate-400 transition group-hover:text-slate-100">{row.bits}</td>
                  <td className="p-1">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black transition group-hover:scale-110",
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

        <div className="grid min-h-0 grid-rows-[auto_auto_auto_1fr] gap-2 overflow-hidden">
          <div className="rounded-lg border border-white/10 bg-black/35 p-3">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              diagnostica stanza 01
            </div>
            <div className="grid gap-2">
              {terminalLines.map(([label, value], index) => (
                <div
                  key={label}
                  className="rounded-md border border-white/10 bg-zinc-950/70 px-3 py-1.5 font-mono text-xs text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <span className="mr-2 text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-zinc-500">{label}</span>
                  <span className="float-right text-zinc-100">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                funzione minima
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {termsOk ? "Y = A'D + AD' + BD'" : "Y = ?"}
              </div>
              <div className="mt-1 text-xs leading-4 text-zinc-500">
                Il terminale mostra la formula solo quando i gruppi K sono corretti.
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                codice indizio
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {doorOpen ? "103" : "? / ? / ?"}
              </div>
              <div className="mt-1 text-xs leading-4 text-zinc-500">
                ricavalo dai mintermini, dalla variabile eliminata e dai blocchi finali
              </div>
            </div>

          <div className="grid min-h-0 gap-2">
            <StatusBox label="Canonica" ok={mintermsOk} />
            <StatusBox label="K-map" ok={termsOk} />
            <StatusBox label="Serratura" ok={doorOpen} />
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}

function RoomTwoTerminalPanel({
  placedWires,
  probeAnswers,
  completed,
}: {
  placedWires: string[];
  probeAnswers: Record<string, number>;
  completed: boolean;
}) {
  const tests = ["1001", "0101", "0110"];

  return (
    <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-72 left-24 opacity-20" fill="white" />
      <div className="relative z-10 h-full">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
              terminale stanza 02
            </p>
            <h2 className="text-2xl font-black">Banco di collaudo</h2>
          </div>
          <div className={cn("rounded-full px-3 py-1 font-mono text-xs font-bold", completed ? "bg-emerald-300/10 text-emerald-100" : "bg-white/10 text-zinc-300")}>
            {completed ? "stabile" : "in test"}
          </div>
        </div>

        <div className="grid h-[calc(100%-4rem)] gap-3 lg:grid-cols-[1fr_330px]">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
              linee circuito
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CIRCUIT_CONNECTIONS.map((wire) => {
                const ok = placedWires.includes(wire.id);
                return (
                  <div
                    key={wire.id}
                    className={cn(
                      "rounded-md border px-3 py-2 text-xs transition",
                      ok
                        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                        : "border-white/10 bg-white/[0.03] text-zinc-500",
                    )}
                  >
                    <div className="font-mono">{wire.label}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.16em]">
                      {ok ? "segnale presente" : "linea assente"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border border-white/10 bg-black/35 p-4">
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                casi di test
              </div>
              <div className="mt-3 grid gap-2">
                {tests.map((key) => {
                  const expected = roomTwoTruth(key);
                  const chosen = probeAnswers[key];
                  return (
                    <div key={key} className="rounded-md border border-white/10 bg-zinc-950/70 px-3 py-2 font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span>ABCD {key}</span>
                        <span className={chosen === expected ? "text-emerald-200" : "text-zinc-500"}>
                          {chosen === expected ? "OK" : "da provare"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-6 text-zinc-400">
              Il terminale qui serve solo al collaudo: se una linea e' presente
              ma un test fallisce, il circuito e' cablato nel posto sbagliato.
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
        "group rounded-lg border px-3 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-white/5",
        ok
          ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
          : "border-white/10 bg-white/[0.04] text-slate-300",
      )}
    >
      {label}: {ok ? "OK" : "in attesa"}
    </div>
  );
}

function NoEvidencePanel({ label, title }: { label: string; title: string }) {
  return (
    <Card className="relative flex h-full items-center justify-center overflow-hidden border-white/10 bg-zinc-950/92 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-72 left-32 opacity-20" fill="white" />
      <div className="absolute inset-8 rounded-lg border border-red-500/10 bg-[linear-gradient(135deg,transparent_48%,rgba(248,113,113,0.12)_49%,rgba(248,113,113,0.12)_51%,transparent_52%)]" />
      <div className="relative text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
          <Lock className="h-8 w-8 text-red-300" />
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.35em] text-red-300/70">
          {label}
        </div>
        <h2 className="mt-4 text-4xl font-black uppercase tracking-[0.08em] text-red-300 line-through decoration-red-400/80 md:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500 line-through decoration-red-500/60">
          Il laboratorio non ha ancora prodotto prove o diagnostiche per questa stanza.
        </p>
      </div>
    </Card>
  );
}

function SupportPanel({ level, type }: { level: number; type: "terminal" | "archive" }) {
  const levelInfo = LEVELS.find((item) => item.level === level);
  const notes = SUPPORT_NOTES[level]?.[type] || [];
  const title = type === "terminal" ? "Console di supporto" : "Dossier della stanza";
  const [selectedNote, setSelectedNote] = useState(0);
  const activeNote = notes[selectedNote] || notes[0];

  return (
    <Card className="relative h-full overflow-hidden border-white/10 bg-zinc-950/92 p-5 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <Spotlight className="-top-72 left-20 opacity-20" fill="white" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:38px_38px] opacity-45" />
      <div className="relative z-10 flex h-full flex-col">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
          stanza {String(level).padStart(2, "0")} / {type}
        </p>
        <h2 className="mt-2 text-3xl font-black">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          {levelInfo?.topic}
        </p>

        <div className="mt-5 grid min-h-0 flex-1 gap-3 md:grid-cols-[0.9fr_1.1fr]">
          {notes.map((note, index) => (
            <button
              key={note}
              type="button"
              onClick={() => setSelectedNote(index)}
              className={cn(
                "group relative overflow-hidden rounded-lg border p-5 text-left transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]",
                selectedNote === index
                  ? "border-white/35 bg-white/[0.08] shadow-lg shadow-white/5"
                  : "border-white/10 bg-black/35",
              )}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/15" />
              <div className="relative font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                {type === "archive" ? "prova" : "nota"} {String(index + 1).padStart(2, "0")}
              </div>
              <div className="relative mt-3 text-lg font-black leading-snug text-zinc-100">
                {note}
              </div>
              {type === "archive" && (
                <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={cn("h-full rounded-full bg-white/60 shadow-[0_0_16px_rgba(255,255,255,0.45)]", selectedNote === index ? "w-full" : "w-1/2")} />
                </div>
              )}
            </button>
          ))}
          {type === "archive" && activeNote && (
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/40 p-5">
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.07] blur-3xl" />
              <div className="relative">
                <div className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
                  prova selezionata
                </div>
                <div className="mt-3 text-2xl font-black text-white">
                  {activeNote.split(":")[0]}
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {activeNote.includes(":") ? activeNote.split(":").slice(1).join(":").trim() : activeNote}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {["leggi", "applica", "verifica"].map((step, index) => (
                    <div key={step} className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-center">
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        step {index + 1}
                      </div>
                      <div className="mt-1 text-sm font-black text-zinc-100">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function EvidenceVisual({
  type,
  unlocked,
  large = false,
}: {
  type: string;
  unlocked: boolean;
  large?: boolean;
}) {
  if (!unlocked) {
    return (
      <div className={cn("flex h-full min-h-[132px] w-full items-center justify-center rounded-md border border-white/10 bg-black/55 font-mono text-4xl font-black tracking-[0.18em] text-zinc-700", large && "min-h-[52vh] text-7xl")}>
        ???
      </div>
    );
  }

  if (type === "truth-proof") {
    return (
      <div className={cn("h-full min-h-[132px] w-full overflow-hidden bg-zinc-950 p-3 font-mono", large && "min-h-[52vh] p-6")}>
        <div className={cn("grid grid-cols-4 gap-1.5", large && "grid-cols-8 gap-2")}>
          {Array.from({ length: 16 }, (_, index) => {
            const active = truth(index) === 1;
            return (
              <div
                key={index}
                className={cn(
                  "rounded border px-2 py-1 text-center text-[10px]",
                  active
                    ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                    : "border-white/10 bg-white/[0.03] text-zinc-500",
                  large && "py-3 text-sm",
                )}
              >
                <div className="font-black">m{index}</div>
                <div className="text-zinc-500">{bits(index).join("")}</div>
                <div>Y={truth(index)}</div>
              </div>
            );
          })}
        </div>
        {large && (
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            Le celle illuminate sono i casi da trasformare in forma canonica.
            Non devi indovinare: parti solo dalle righe con uscita attiva.
          </p>
        )}
      </div>
    );
  }

  if (type === "kmap-proof") {
    const cells = [
      [0, 1, 3, 2],
      [4, 5, 7, 6],
      [12, 13, 15, 14],
      [8, 9, 11, 10],
    ];
    const labels = ["00", "01", "11", "10"];
    const groups = [
      ["Gruppo alto", "quattro celle adiacenti nella parte superiore"],
      ["Gruppo sinistro", "celle attive con la stessa colonna logica"],
      ["Gruppo a bordo", "usa l'adiacenza tra estremi della mappa"],
    ];
    return (
      <div className={cn("h-full min-h-[132px] w-full overflow-hidden bg-zinc-950 p-3 font-mono", large && "min-h-[52vh] p-6")}>
        <div className={cn("grid gap-4", large && "grid-cols-[1fr_0.75fr]")}>
          <div className="rounded-lg border border-white/10 bg-black/35 p-3">
            <div className="mb-2 grid grid-cols-[44px_repeat(4,1fr)] gap-1 text-center text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              <div>AB/CD</div>
              {labels.map((label) => <div key={label}>{label}</div>)}
            </div>
            <div className="grid grid-cols-[44px_repeat(4,1fr)] gap-1">
              {cells.map((row, rowIndex) => [
                <div key={`r-${labels[rowIndex]}`} className="flex items-center justify-center rounded border border-white/10 bg-white/[0.035] text-xs font-black text-zinc-400">
                  {labels[rowIndex]}
                </div>,
                ...row.map((minterm) => {
                  const active = truth(minterm) === 1;
                  return (
                    <div
                      key={minterm}
                      className={cn(
                        "grid min-h-12 place-items-center rounded-md border text-xs font-black transition",
                        active
                          ? "border-emerald-200/35 bg-emerald-200/12 text-emerald-50 shadow-[0_0_16px_rgba(167,243,208,0.12)]"
                          : "border-white/10 bg-white/[0.025] text-zinc-600",
                        large && "min-h-20 text-lg",
                      )}
                    >
                      <span>m{minterm}</span>
                      <span className="text-[10px] font-semibold text-zinc-500">Y={truth(minterm)}</span>
                    </div>
                  );
                }),
              ])}
            </div>
          </div>
          <div className={cn("grid gap-2", !large && "hidden")}>
            {groups.map(([title, body], index) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                  traccia {index + 1}
                </div>
                <div className="mt-2 text-lg font-black text-white">{title}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
        {large && (
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            Le tracce indicano dove guardare, ma non scrivono la formula al posto tuo:
            confronta le coordinate di ogni gruppo e conserva solo le variabili costanti.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid h-full min-h-[132px] w-full place-items-center bg-zinc-950 p-3 font-mono", large && "min-h-[52vh] p-6")}>
      <div className="grid w-full max-w-xl gap-3">
        {[
          ["Mintermini accesi", "conta le celle Y=1 del registro"],
          ["Variabile neutralizzata", "trova la lettera assente nei gruppi finali"],
          ["Blocchi finali", "conta i gruppi K usati dalla serratura"],
        ].map(([label, hint], index) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">cifra {index + 1}</div>
            <div className="mt-1 text-base font-black text-white">{label}</div>
            <div className="mt-1 text-xs leading-5 text-zinc-500">{hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchivePanel({
  mintermsOk,
  termsOk,
  doorOpen,
  stanzaCompleted,
  currentRoom,
}: {
  mintermsOk: boolean;
  termsOk: boolean;
  doorOpen: boolean;
  stanzaCompleted: boolean;
  currentRoom: number;
}) {
  const documents = [
    {
      title: "Registro della verita'",
      description: "Prova iniziale: individua le righe in cui l'uscita vale 1.",
      tag: "prova 01",
      src: "truth-proof",
      unlocked: true,
    },
    {
      title: "Mappa K danneggiata",
      description: "Sbloccata dopo la canonica: mostra la forma dei gruppi, non la risposta.",
      tag: "prova 02",
      src: "kmap-proof",
      unlocked: mintermsOk || stanzaCompleted,
    },
    {
      title: "Frammento del codice",
      description: "Sbloccato dopo la K-map: trasforma il ragionamento in tre conteggi.",
      tag: "prova 03",
      src: "code-proof",
      unlocked: termsOk || stanzaCompleted,
    },
  ];
  const [openDocument, setOpenDocument] = useState<(typeof documents)[number] | null>(null);

  if (currentRoom !== 1) {
    return <SupportPanel level={currentRoom} type="archive" />;
  }

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
            <h2 className="mt-1 text-2xl font-black">Archivio prove</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              Le prove non sono collezionabili: servono per aprire la Stanza 01.
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
                  protocollo prove
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  Prova &gt; Obiettivo &gt; Sblocco
                </div>
                <div className="mt-2 text-xs leading-5 text-zinc-500">
                  usa ogni documento per superare la fase successiva della porta
                </div>
              </div>

              <div className="grid gap-2">
                {[
                  ["Registro verita'", true],
                  ["Mappa K", mintermsOk || stanzaCompleted],
                  ["Frammento codice", termsOk || stanzaCompleted],
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
                  {document.src.endsWith("-proof") ? (
                    <EvidenceVisual type={document.src} unlocked={document.unlocked} />
                  ) : (
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
                  )}
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
                    {!document.unlocked
                      ? "Documento sigillato: completa la prova precedente per aprirlo."
                      : document.description}
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
            {openDocument.src.endsWith("-proof") ? (
              <EvidenceVisual type={openDocument.src} unlocked={openDocument.unlocked} large />
            ) : (
              <Image
                src={openDocument.src}
                alt={openDocument.title}
                width={1400}
                height={900}
                className="max-h-[72vh] w-full rounded-md object-contain"
              />
            )}
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
  room2Unlocked,
  room2Completed,
  room2Progress,
  room2Max,
  completedLevels,
  unlockedLevels,
  onEnterRoom2,
  onEnterLevel,
}: {
  mintermsOk: boolean;
  termsOk: boolean;
  doorOpen: boolean;
  room2Unlocked: boolean;
  room2Completed: boolean;
  room2Progress: number;
  room2Max: number;
  completedLevels: number[];
  unlockedLevels: number[];
  onEnterRoom2: () => void;
  onEnterLevel: (level: number) => void;
}) {
  return (
    <Card className="h-full overflow-hidden border-white/10 bg-zinc-950/92 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
        struttura del gioco
      </p>
      <div className="mt-1 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-black">Percorso livelli</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Otto stanze in sequenza: si parte dalla forma canonica e si arriva
            alla porta finale con circuito, mappa, simulazione e multimedialita'.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
            progresso totale
          </div>
          <div className="mt-1 text-2xl font-black">{Math.max(completedLevels.length, doorOpen ? 1 : 0)}/8</div>
        </div>
      </div>

      <div className="mt-4 grid h-[calc(100%-7rem)] grid-cols-4 gap-3">
        {LEVELS.map((level) => {
          const complete =
            level.level === 1
              ? doorOpen
              : level.level === 2
                ? room2Completed
                : completedLevels.includes(level.level);
          const unlocked = unlockedLevels.includes(level.level);
          const progress =
            level.level === 1
              ? [mintermsOk, termsOk, doorOpen].filter(Boolean).length
              : level.level === 2
                ? room2Progress
                : complete
                  ? 1
                  : 0;
          const maxProgress = level.level === 1 ? 3 : level.level === 2 ? room2Max : 1;
          const progressPercent = Math.round((progress / maxProgress) * 100);
          return (
            <button
              key={level.level}
              type="button"
              onClick={() => (level.level === 2 ? onEnterRoom2() : onEnterLevel(level.level))}
              className={cn(
                "group relative overflow-hidden rounded-lg border p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg",
                unlocked
                  ? "border-white/20 bg-white/[0.07] hover:border-white/35 hover:bg-white/[0.1] hover:shadow-white/5"
                  : "border-white/10 bg-white/[0.025] opacity-50",
              )}
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/20" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                    livello {String(level.level).padStart(2, "0")}
                  </div>
                  <div className="mt-2 text-xl font-black text-white">{level.title}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-400">{level.topic}</div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    <span>progresso</span>
                    <span>{progress}/{maxProgress}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        complete ? "bg-emerald-200" : "bg-white/70",
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    "mt-4 rounded-full px-3 py-1 text-xs font-semibold",
                    complete
                      ? "bg-emerald-300/10 text-emerald-100"
                      : unlocked
                        ? "bg-white/[0.12] text-slate-200"
                        : "bg-white/10 text-slate-500",
                  )}
                >
                  {complete ? "completata" : unlocked ? "entra" : "bloccata"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
