import { create } from "zustand";
import {
  listRestorationPlan,
  submitRestorationPlan,
  voteRestorationPlan,
  updateRestorationPlanContent
} from "../api/RestorationPlan";
import type { RestorationPlan } from "../types/RestorationPlan";

type State = {
  rows: RestorationPlan[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  submit: (id: number) => Promise<void>;
  vote: (
    id: number,
    payload: { expert_id: number; expert_name?: string; decision: "APPROVED" | "REJECTED"; comment?: string }
  ) => Promise<void>;
  updateContent: (id: number, patch: { plan_title?: string; method?: string; risk_assessment?: string }) => Promise<void>;
};

const upsert = (rows: RestorationPlan[], row: RestorationPlan) =>
  rows.some((item) => item.id === row.id) ? rows.map((item) => (item.id === row.id ? row : item)) : [...rows, row];

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      set({ rows: await listRestorationPlan(), loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  async submit(id) {
    set({ error: null });
    try {
      const row = await submitRestorationPlan(id);
      set({ rows: upsert(get().rows, row) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  async vote(id, payload) {
    set({ error: null });
    try {
      const row = await voteRestorationPlan(id, payload);
      set({ rows: upsert(get().rows, row) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  async updateContent(id, patch) {
    set({ error: null });
    try {
      const row = await updateRestorationPlanContent(id, patch);
      set({ rows: upsert(get().rows, row) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  }
}));
