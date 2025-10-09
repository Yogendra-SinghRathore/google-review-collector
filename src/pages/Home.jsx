import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { signInWithGoogle } from "../auth";
import { useEffect, useState } from "react";
import "./Home.css";

const Home = () => {
  const supabase = useSupabaseClient();
  const user = useUser();

  const [businessName, setBusinessName] = useState("");
  const [businessLink, setBusinessLink] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") console.error(error);
      if (data) {
        setBusinessName(data.business_name || "");
        setBusinessLink(data.business_link || "");
        setSaved(true);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const handleSave = async () => {
    if (!businessName.trim() || !businessLink.trim()) {
      alert("Please enter both Business Name and Link.");
      return;
    }
    try {
      new URL(businessLink);
    } catch {
      alert("Please enter a valid URL for the Business Link.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        business_name: businessName.trim(),
        business_link: businessLink.trim(),
        updated_at: new Date(),
      },
      { onConflict: "user_id" }
    );

    if (error) console.error("Error saving profile:", error);
    else {
      setSaved(true);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }

    setSaving(false);
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h3>Please sign in to use the app</h3>
          <button className="btn btn-primary mt-3" onClick={signInWithGoogle}>
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {saved ? (
        <h2>Welcome back, {businessName}!</h2>
      ) : (
        <div className="business-inputs">
          <input
            type="text"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <input
            type="url"
            placeholder="Business Link"
            value={businessLink}
            onChange={(e) => setBusinessLink(e.target.value)}
          />
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
      {toast && <div className="toast-confirmation">Business info saved!</div>}
    </div>
  );
};

export default Home;
