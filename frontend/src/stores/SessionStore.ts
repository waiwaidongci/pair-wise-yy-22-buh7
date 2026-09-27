import { create } from "zustand";
import { readSession, writeSession, type SessionActor } from "../api/request";

type SessionState = SessionActor & {
  setRole: (role: SessionActor["role"]) => void;
  setExpert: (expertId: number, expertName: string) => void;
};

export const EXPERT_ACCOUNTS: Array<{ id: number; name: string }> = [
  { id: 901, name: "周专家" },
  { id: 902, name: "陈专家" },
  { id: 903, name: "吴专家" },
  { id: 904, name: "郑专家" }
];

const initial = readSession();

export const useSessionStore = create<SessionState>((set) => ({
  ...initial,
  setRole: (role) => {
    const next = { ...readSession(), role };
    writeSession(next);
    set(next);
  },
  setExpert: (userId, userName) => {
    const next = { ...readSession(), role: "EXPERT" as const, userId, userName };
    writeSession(next);
    set(next);
  }
}));
