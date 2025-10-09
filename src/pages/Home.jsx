import React, { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import "./Home.css";

// Small helper icon component
const HeroIcon = ({ svg }) => <div className="hero-icon mb-2">{svg}</div>;

// ------------------ MARKETING SECTION ------------------
const MarketingHome = () => (
  <>
    {/* Hero Section */}
    <section className="text-center mb-5 hero-section">
      <div className="hero-illustration mb-3">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0d6efd"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l7 7-7 7-7-7 7-7z" />
          <path d="M12 12v10" />
        </svg>
      </div>
      <h1 className="h3 mb-2">Get More Google Reviews</h1>
      <p className="lead mb-3">
        Quickly collect reviews from your customers via WhatsApp.
      </p>
      <a href="/send" className="btn btn-primary btn-lg w-100 mb-2">
        Send Your First Request
      </a>
      <a href="#how-it-works" className="btn btn-outline-primary btn-lg w-100">
        How It Works
      </a>
    </section>

    {/* Why Use Section */}
    <section className="mb-5 text-center">
      <h2 className="h5 mb-2">Why Use Review Collector?</h2>
      <p className="mb-0">
        Small businesses struggle to get Google reviews. We make it simple:
        send a link via WhatsApp and track responses—all in one place.
      </p>
    </section>

    {/* How It Works */}
    <section id="how-it-works" className="mb-5">
      <h2 className="h5 mb-3 text-center">3 Simple Steps</h2>
      <div className="d-flex flex-column gap-3">
        <div className="p-3 border rounded shadow-sm step-card">
          <HeroIcon
            svg={
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0d6efd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
            }
          />
          <strong>1. Add Customer</strong>
          <p className="mb-0">Enter your customer's name and phone number.</p>
        </div>
        <div className="p-3 border rounded shadow-sm step-card">
          <HeroIcon
            svg={
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0d6efd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            }
          />
          <strong>2. Send WhatsApp Link</strong>
          <p className="mb-0">Send the Google review link with one tap.</p>
        </div>
        <div className="p-3 border rounded shadow-sm step-card">
          <HeroIcon
            svg={
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0d6efd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <strong>3. Track Reviews</strong>
          <p className="mb-0">
            See who left a review and manage responses easily.
          </p>
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="mb-5 text-center">
      <h2 className="h5 mb-3">What Users Say</h2>
      <div className="d-flex flex-column gap-3">
        <div className="p-3 border rounded shadow-sm testimonial-card">
          <p className="mb-0">"We got more reviews in a week than before!"</p>
          <small>- Salon Owner</small>
        </div>
        <div className="p-3 border rounded shadow-sm testimonial-card">
          <p className="mb-0">"Super easy to use on mobile!"</p>
          <small>- Gym Owner</small>
        </div>
      </div>
    </section>
  </>
);

// ------------------ SETUP HOME SECTION ------------------
const SetupHome = ({
  businessName,
  setBusinessName,
  businessLink,
  setBusinessLink,
  handleSave,
  saving,
}) => (
  <>
    <div className="hero-text-top">
      <div className="hero-illustration mb-3">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0d6efd"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l7 7-7 7-7-7 7-7z" />
          <path d="M12 12v10" />
        </svg>
      </div>
      <h1>Get More Google Reviews</h1>
      <p>Quickly collect reviews from your customers via WhatsApp.</p>
    </div>

    <div className="business-inputs">
      <div>
        <label>Business Name</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Your business name"
        />
        <small>This will appear in all messages sent to your customers.</small>
      </div>
      <div>
        <label>Business Link</label>
        <input
          type="url"
          value={businessLink}
          onChange={(e) => setBusinessLink(e.target.value)}
          placeholder="https://example.com/review-link"
        />
        <small>
          Customers will be redirected here when they click the review link.
        </small>
      </div>
      <button className="btn-save" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>

    <a
      href="#how-it-works"
      className="btn btn-outline-primary btn-lg w-100 mb-3"
    >
      How It Works
    </a>
  </>
);

// ------------------ MAIN COMPONENT ------------------
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

  // Save profile
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

  return (
    <div className="container py-4">
      {!user ? (
        <>
          <MarketingHome />
          <div className="text-center mt-5">
            <h3>Please sign in to use the app</h3>
            <button
              className="btn btn-primary mt-3"
              onClick={() =>
                supabase.auth.signInWithOAuth({ provider: "google" })
              }
            >
              Sign In with Google
            </button>
          </div>
        </>
      ) : saved ? (
        <MarketingHome />
      ) : (
        <SetupHome
          businessName={businessName}
          setBusinessName={setBusinessName}
          businessLink={businessLink}
          setBusinessLink={setBusinessLink}
          handleSave={handleSave}
          saving={saving}
        />
      )}

      {toast && <div className="toast-confirmation">Business info saved!</div>}
    </div>
  );
};

export default Home;
