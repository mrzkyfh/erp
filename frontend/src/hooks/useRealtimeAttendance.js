import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useRealtimeAttendance(onReceive) {
  useEffect(() => {
    const channel = supabase
      .channel("attendance-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance_logs",
        },
        (payload) => onReceive?.(payload),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onReceive]);
}

