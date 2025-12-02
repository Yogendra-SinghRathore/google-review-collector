import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./RedirectReview.css";

const RedirectReview = () => {
  const { id } = useParams();
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import("../supabaseClient");
      const { data } = await supabase
        .from("review_requests")
        .select("message")
        .eq("id", id)
        .single();

      if (data) {
        setBusinessName(data.message?.split("\n")[1] || "");
      }
    };

    fetchData();

    const timeout = setTimeout(() => {
      window.location.href =
        `https://xpvwpeczbloarigllmra.supabase.co/functions/v1/redirectReview?id=${id}`;
    }, 1000);

    return () => clearTimeout(timeout);
  }, [id]);

  const redirectUrl =
    `https://xpvwpeczbloarigllmra.supabase.co/functions/v1/redirectReview?id=${id}`;

  return (
    <div className="redirect-wrapper">
      <div className="redirect-card">
        <h3 className="redirect-title">
          Redirecting you to leave a review for <strong>{businessName}</strong>...
        </h3>

        <p className="redirect-text">
          If not redirected automatically,{" "}
          <a className="redirect-link" href={redirectUrl}>
            click here
          </a>.
        </p>
      </div>
    </div>
  );
};

export default RedirectReview;
