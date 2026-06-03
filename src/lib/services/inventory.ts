import { supabase } from "@/utils/supabase/client";

export interface HarvestLog {
  id?: string;
  weight: number;
  moisture: number;
  grade: string;
  location: string;
  timestamp: any;
  status: "SYNCED" | "PENDING";
}

export const logHarvest = async (data: Omit<HarvestLog, "timestamp" | "status">) => {
  try {
    const { data: insertedData, error } = await supabase
      .from("harvests")
      .insert({
        ...data,
        status: "SYNCED",
        // Let the Postgres database handle default timestamps if configured, 
        // otherwise we could provide: timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return insertedData.id;
  } catch (error) {
    console.error("Error logging harvest: ", error);
    throw error;
  }
};

export const subscribeToHarvests = (callback: (harvests: HarvestLog[]) => void) => {
  const fetchHarvests = async () => {
    const { data, error } = await supabase
      .from("harvests")
      .select("*")
      .order("timestamp", { ascending: false });
    
    if (!error && data) {
      callback(data as HarvestLog[]);
    }
  };

  fetchHarvests();

  const channel = supabase
    .channel("harvests_channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "harvests" },
      () => {
        fetchHarvests();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
