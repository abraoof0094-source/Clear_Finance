import { universalStorage, Transaction } from "./clientStorage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

class AppSync {
  private supabase: SupabaseClient | null = null;
  public enabled = false;

  init() {
    if (SUPABASE_URL && SUPABASE_KEY) {
      this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
      });
      this.enabled = true;
    } else {
      this.enabled = false;
    }
    return this.enabled;
  }

  async pushTransaction(t: Transaction) {
    if (!this.enabled || !this.supabase) return;
    try {
      const payload = {
        id: t.id,
        type: t.type,
        mainCategory: t.mainCategory,
        subCategory: t.subCategory,
        amount: t.amount,
        date: t.date,
        time: t.time,
        timestamp: t.timestamp,
      } as any;

      await this.supabase.from("transactions").upsert(payload, { onConflict: ["id"] });
    } catch (err) {
      console.warn("Supabase pushTransaction failed:", err);
    }
  }

  async pullAll(): Promise<Transaction[]> {
    if (!this.enabled || !this.supabase) return [];
    try {
      const { data, error } = await this.supabase
        .from("transactions")
        .select("id,type,mainCategory,subCategory,amount,date,time,timestamp");
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        type: r.type,
        mainCategory: r.mainCategory,
        subCategory: r.subCategory,
        amount: Number(r.amount),
        date: r.date,
        time: r.time,
        timestamp: Number(r.timestamp),
      } as Transaction));
    } catch (err) {
      console.warn("Supabase pullAll failed:", err);
      return [];
    }
  }

  // Merge remote into local: prefer newer timestamp
  async pullAndMerge() {
    if (!this.enabled) return;
    try {
      const remote = await this.pullAll();
      const local = await universalStorage.getRecentTransactions(1000000); // get all (practical limit)

      const localMap = new Map(local.map((l) => [l.id, l]));

      // For each remote, if not present locally or remote newer -- replace locally
      for (const r of remote) {
        const localItem = localMap.get(r.id);
        if (!localItem) {
          // insert local
          await universalStorage.addTransaction({
            type: r.type,
            mainCategory: r.mainCategory,
            subCategory: r.subCategory,
            amount: r.amount,
            date: r.date,
            time: r.time,
          });
          // Note: addTransaction will create a new id and timestamp locally; to preserve remote id/timestamp we'd need a dedicated import. Skipping to avoid conflicts.
        } else if (r.timestamp > localItem.timestamp) {
          // remote newer -> delete local & insert remote
          await universalStorage.deleteTransaction(localItem.id);
          await universalStorage.addTransaction({
            type: r.type,
            mainCategory: r.mainCategory,
            subCategory: r.subCategory,
            amount: r.amount,
            date: r.date,
            time: r.time,
          });
        }
      }

      // Push local-only items to remote
      const remoteIds = new Set(remote.map((x) => x.id));
      for (const l of local) {
        if (!remoteIds.has(l.id)) {
          await this.pushTransaction(l);
        }
      }
    } catch (err) {
      console.warn("pullAndMerge failed:", err);
    }
  }
}

export const appSync = new AppSync();
