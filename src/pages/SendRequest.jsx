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

  // ✅ Fetch business info from DB
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

  // ✅ Normalize phone input (remove spaces, +, -, (), etc.)
  const normalizePhone = (input) => {
    if (!input) return "";
    let cleaned = input.replace(/[^\d]/g, ""); // keep only digits

    // Remove leading 0
    if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);

    // Add default India code if only 10 digits
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }

    return cleaned;
  };

  // ✅ Handle phone input changes
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const normalized = normalizePhone(input);
    setPhone(normalized);
  };

  // ✅ Live preview update
  useEffect(() => {
    const text = message
      ? message
      : `Hi ${name || "[Customer Name]"}, please leave a review for\n${
          businessName || "[Business Name]"
        }\n${businessLink || "https://your-default-review-link.com"}`;
    setPreviewMessage(text);
  }, [name, message, businessName, businessLink]);

  // ✅ Validate input
  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      alert("Please enter a valid name (at least 2 characters).");
      return false;
    }
    if (phone.length < 10 || phone.length > 15) {
      alert("Please enter a valid phone number (10–15 digits).");
      return false;
    }
    return true;
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!validateForm()) return;

    const finalPhone = normalizePhone(phone);

    // Build WhatsApp message
    const textWithLineBreaks = `${
      name ? `Hi ${name}, You Recenlty Visited please leave a review for` : "Hi [Customer Name], please leave a review for"
    }%0A${businessName || "[Business Name]"}%0A${
      businessLink || "https://your-default-review-link.com"
    }`;

    const waLink = `https://wa.me/${finalPhone}?text=${textWithLineBreaks}`;

    // Save request to Supabase
    const { error } = await supabase.from("review_requests").insert([
      {
        user_id: user.id,
        name,
        phone: finalPhone,
        message: `Hi ${name}, please leave a review for ${
          businessName || "[Business Name]"
        }!`,
        status: "Pending",
      },
    ]);

    if (error) {
      console.error("Error saving request:", error);
      alert("Failed to save request.");
      return;
    }

    // Open WhatsApp
    window.open(waLink, "_blank");

    // Show toast
    setToast(true);
    setTimeout(() => setToast(false), 3000);

    // Reset form
    setName("");
    setPhone("");
    setMessage("");
  };

  // ✅ If user not logged in
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

  // ✅ Main UI
  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Send Review Request</h1>

      <form onSubmit={handleSubmit}>
        {/* Customer Name */}
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

        {/* Customer Phone */}
        <div className="mb-3">
          <label className="form-label">Customer Phone Number</label>
          <input
            type="tel"
            className="form-control form-control-lg"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Enter phone number (E.g., +91 99814 35014)"
            required
          />
        </div>

        {/* Optional Message */}
        <div className="mb-3">
          <label className="form-label">Message (Optional)</label>
          <textarea
            className="form-control form-control-lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a custom message"
          />
        </div>

        {/* Preview */}
        <div className="mb-3 preview-message">
          <label className="form-label">Message Preview:</label>
          <div className="preview-box">{previewMessage}</div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-success btn-lg w-100">
          Send via WhatsApp
        </button>
      </form>

      {toast && <div className="toast-confirmation">Request saved successfully!</div>}
    </div>
  );
}

export default SendRequest;
