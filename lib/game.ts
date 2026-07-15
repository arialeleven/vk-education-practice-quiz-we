export type QuestionType = "single" | "multiple";

export interface Question {
  text: string;
  imageUrl?: string;
  type: QuestionType;
  options: string[];
  correct: number[];
  timeLimit: number;
}
export interface Quiz {
  title: string;
  questions: Question[];
}
export type Phase = "lobby" | "question" | "reveal" | "final";

export interface PublicPlayer {
  id: string;
  name: string;
  score: number;
}
export interface StateMessage {
  type: "state";
  phase: Phase;
  qIndex: number;
  total: number;
  quizTitle: string;
  question:
    | { text: string; imageUrl?: string; type: QuestionType; options: string[]; timeLimit: number }
    | null;
  correct: number[] | null;
  questionStart: number;
  players: PublicPlayer[];
  answeredCount: number;
  youAnswered: boolean;
}

export const TILES = [
  { bg: "bg-rose-500", text: "text-white", shape: "▲" },
  { bg: "bg-sky-500", text: "text-white", shape: "◆" },
  { bg: "bg-amber-400", text: "text-amber-950", shape: "●" },
  { bg: "bg-emerald-500", text: "text-white", shape: "■" },
];

export function genRoomCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}
