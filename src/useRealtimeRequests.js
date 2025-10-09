import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

export const useRealtimeRequests = () => {
  const user = useUser();
  const userId = user?.id; // Supabase user ID
  const [requests, setRequests] = useState([]);

  const handleRealtime = (payload) => {
    const newRow = payload.new;
    const oldRow = payload.old;

    switch (payload.eventType) {
      case "INSERT":
        setRequests((prev) => [newRow, ...prev]);
        break;
      case "UPDATE":
        setRequests((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
        break;
      case "DELETE":
        setRequests((prev) => prev.filter((r) => r.id !== oldRow.id));
        break;
      default:
        break;
    }
  };

  const loadRequests = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("review_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error loading requests:", error);
    else setRequests(data);
  };

  useEffect(() => {
    if (!userId) return;

    loadRequests();

    const channel = supabase
      .channel(`review_requests_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "review_requests",
          filter: `user_id=eq.${userId}`,
        },
        handleRealtime
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return requests;
};
