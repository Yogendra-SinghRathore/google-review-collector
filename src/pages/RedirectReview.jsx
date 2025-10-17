import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const RedirectReview = () => {
  const { id } = useParams(); // gets the request-id from /r/:id
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    // Optional: Fetch business info from Supabase review_requests table
    const fetchData = async () => {
      const { supabase } = await import("../supabaseClient");
      const { data } = await supabase
        .from("review_requests")
        .select("message")
        .eq("id", id)
        .single();
      if (data) {
        // Parse message or fetch business name if needed
        setBusinessName(data.message?.split("\n")[1] || "");
      }
    };
    fetchData();

    // Redirect after a tiny delay
    const timeout = setTimeout(() => {
      window.location.href = `https://xpvwpeczbloarigllmra.supabase.co/functions/v1/redirectReview?id=${id}`;
    }, 1000);

    return () => clearTimeout(timeout);
  }, [id]);

  return (
    <div style={{ textAlign: "center", marginTop: "20vh" }}>
      <h3>Redirecting you to leave a review for <strong>{businessName}</strong>...</h3>
      <p>If not redirected automatically, <a href={`https://xpvwpeczbloarigllmra.supabase.co/functions/v1/redirectReview?id=${id}`}>click here</a>.</p>
    </div>
  );
};

export default RedirectReview;
