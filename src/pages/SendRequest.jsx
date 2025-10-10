import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";
import "./SendRequest.css";

function SendRequest() {
  const user = useUser();
  const supabaseClient = useSupabaseClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessLink, setBusinessLink] = useState("");

  // Fetch business info from DB
  useEffect(() => {
    if (!user) return;

    const fetchBusinessInfo = async () => {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("business_name, business_link")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) console.error("Error fetching business info:", error);
      if (data) {
        setBusinessName(data.business_name || "");
        setBusinessLink(data.business_link || "");
      }
    };

    fetchBusinessInfo();
  }, [user, supabaseClient]);

  // Live preview update
  useEffect(() => {
    const text = message
      ? message
      : `Hi ${name || "[Customer Name]"}, please leave a review for\n${businessName || "[Business Name]"}\n${businessLink || "https://your-default-review-link.com"}`;
    setPreviewMessage(text);
  }, [name, message, businessName, businessLink]);

  // Validate input
  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      alert("Please enter a valid name (at least 2 characters).");
      return false;
    }
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid phone number (10–15 digits).");
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!validateForm()) return;

    // Build WhatsApp message with line breaks
    const textWithLineBreaks = `${name ? `Hi ${name}, please leave a review for` : "Hi [Customer Name], please leave a review for"}%0A${businessName || "[Business Name]"}%0A${businessLink || "https://your-default-review-link.com"}`;

    const waLink = `https://wa.me/${phone.replace(/\D/g, "")}?text=${textWithLineBreaks}`;

    // Save request to Supabase
    const { error } = await supabase.from("review_requests").insert([
      {
        user_id: user.id,
        name,
        phone,
        message: `Hi ${name}, please leave a review for ${businessName || "[Business Name]"}!`,
        status: "Pending",
      },
    ]);

    if (error) {
      console.error("Error saving request:", error);
      alert("Failed to save request.");
      return;
    }

    // Open WhatsApp in a new tab
    window.open(waLink, "_blank");

    // Show toast
    setToast(true);
    setTimeout(() => setToast(false), 3000);

    // Clear form
    setName("");
    setPhone("");
    setMessage("");
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h3>Please sign in to send requests</h3>
          <button
            className="btn btn-primary mt-3"
            onClick={async () => {
              const { supabase } = await import("../supabaseClient");
              supabase.auth.signInWithOAuth({ provider: "google" });
            }}
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Send Review Request</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Customer Name</label>
          <input
            type="text"
            className="form-control form-control-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Customer Phone Number</label>
          <input
            type="tel"
            className="form-control form-control-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number with country code"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Message (Optional)</label>
          <textarea
            className="form-control form-control-lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a custom message"
          />
        </div>

        <div className="mb-3 preview-message">
          <label className="form-label">Message Preview:</label>
          <div className="preview-box">{previewMessage}</div>
        </div>

        <button type="submit" className="btn btn-success btn-lg w-100">
          Send via WhatsApp
        </button>
      </form>

      {toast && <div className="toast-confirmation">Request saved successfully!</div>}
    </div>
  );
}

export default SendRequest;
