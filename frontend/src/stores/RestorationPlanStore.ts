import { create } from "zustand";
import {
  listRestorationPlan,
  submitRestorationPlan,
  resubmitRestorationPlan,
  reviseRestorationPlan,
  decideRestorationPlan
} from "../api/RestorationPlan";
import type { PlanDetail } from "../types/RestorationPlan";
import type { PlanApprovalDecision } from "../constants/PlanApprovalStatus";

type State = {
  rows: PlanDetail[];
  loading: boolean;
  error: string | null;
  lastActionAt: number;
  load: () => Promise<void>;
  submit: (id: number) => Promise<void>;
  resubmit: (id: number) => Promise<void>;
  revise: (
    id: number,
    patch: { plan_title: string; method: string; risk_assessment: string }
  ) => Promise<void>;
  decide: (id: number, decision: PlanApprovalDecision, comment: string) => Promise<void>;
  clearError: () => void;
};

function upsert(rows: PlanDetail[], detail: PlanDetail): PlanDetail[] {
  const exists = rows.some((row) => row.plan.id === detail.plan.id);
  return exists
    ? rows.map((row) => (row.plan.id === detail.plan.id ? detail : row))
    : [...rows, detail];
}

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: null,
  lastActionAt: 0,

  async load() {
    set({ loading: true, error: null });
    try {
      const rows = await listRestorationPlan();
      set({ rows, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "加载失败" });
    }
  },

  clearError() {
    set({ error: null });
  },

  async submit(id) {
    set({ error: null });
    try {
      const detail = await submitRestorationPlan(id);
      set({ rows: upsert(get().rows, detail), lastActionAt: Date.now() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "送审失败" });
    }
  },

  async resubmit(id) {
    set({ error: null });
    try {
      const detail = await resubmitRestorationPlan(id);
      set({ rows: upsert(get().rows, detail), lastActionAt: Date.now() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "重新送审失败" });
    }
  },

  async revise(id, patch) {
    set({ error: null });
    try {
      const detail = await reviseRestorationPlan(id, patch);
      set({ rows: upsert(get().rows, detail), lastActionAt: Date.now() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "保存方案失败" });
    }
  },

  async decide(id, decision, comment) {
    set({ error: null });
    try {
      const detail = await decideRestorationPlan(id, decision, comment);
      set({ rows: upsert(get().rows, detail), lastActionAt: Date.now() });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "提交意见失败" });
    }
  }
}));
