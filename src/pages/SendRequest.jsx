import { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";
import "./SendRequest.css";
import { useNavigate } from "react-router-dom";

function SendRequest() {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessLink, setBusinessLink] = useState("");

  // Fetch business info
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

  // Handle phone input (digits only)
  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/[^\d]/g, "");
    setPhone(cleaned);
  };

  // Normalize phone for sending
  const getFinalPhone = (input) => {
    if (!input) return "";
    let cleaned = input.replace(/[^\d]/g, "");
    if (cleaned.startsWith("0")) cleaned = cleaned.slice(1);
    if (cleaned.length === 10) cleaned = "91" + cleaned;
    return cleaned;
  };

  // Live preview
  useEffect(() => {
    const text = message
      ? message
      : `Hi ${name || "[Customer Name]"}, please leave a review for\n${
          businessName || "[Business Name]"
        }\n${businessLink || "https://your-default-review-link.com"}`;
    setPreviewMessage(text);
  }, [name, message, businessName, businessLink]);

  // Validate input
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

  // Send via WhatsApp
  const handleSend = async () => {
    if (!user || !validateForm()) return;

    const finalPhone = getFinalPhone(phone);
    const textWithLineBreaks = message
      ? message
      : `Hi ${name}, You recently visited, please leave a review for\n${businessName}\n${businessLink}`;

    // Save to review_requests and get the new id
    const { data: insertedData, error } = await supabase
      .from("review_requests")
      .insert([
        {
          user_id: user.id,
          name,
          phone: finalPhone,
          message: textWithLineBreaks,
          status: "Pending",
        },
      ])
      .select("id")
      .single();

    if (error || !insertedData) {
      console.error("Error saving request:", error);
      alert("Failed to send request.");
      return;
    }

    const newRequestId = insertedData.id;

    // WhatsApp link with the tracking URL inside the message
    const trackedGoogleLink = `https://xpvwpeczbloarigllmra.supabase.co/functions/v1/redirectReview?id=${newRequestId}`;
    const waMessage = message
      ? message
      : `Hi ${name}, You recently visited ⭐ *"${businessName}"* ⭐, please leave a review for Us \n${trackedGoogleLink}`;
    const waLink = `https://wa.me/${finalPhone}?text=${encodeURIComponent(
      waMessage
    )}`;

    // Open WhatsApp
    window.open(waLink, "_blank");

    setToastMsg("Request sent successfully!");
    setToast(true);
    setTimeout(() => setToast(false), 3000);

    setName("");
    setPhone("");
    setMessage("");
  };

  // Save to customers table
  const handleSaveCustomer = async () => {
    if (!user || !validateForm()) return;

    const finalPhone = getFinalPhone(phone);

    const { error } = await supabase.from("customers").insert([
      {
        user_id: user.id,
        name,
        phone: finalPhone,
        message,
      },
    ]);

    if (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer.");
      return;
    }

    setToastMsg("Customer saved successfully!");
    setToast(true);
    setTimeout(() => setToast(false), 3000);

    setName("");
    setPhone("");
    setMessage("");
  };

  if (!user) {
    return (
      <div className="page-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--text-dark)", marginBottom: 12 }}>Please sign in to send requests</h3>
          <button
            className="btn-send"
            style={{ width: 220, display: "inline-block" }}
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
    <div className="page-container">
      <h1 className="page-heading">Send Review Request</h1>

      <div className="card" role="region" aria-labelledby="customer-form">
        <form>
          <div className="form-grid">
            {/* Customer Name */}
            <div className="form-group" id="customer-form">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="label">Customer Name</label>
                <div>
                  <button
                    type="button"
                    className="inline-link-btn"
                    onClick={() => navigate("/customers_list")}
                  >
                    View Customers List →
                  </button>
                </div>
              </div>
              <input
                type="text"
                className="input-large"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>

            {/* Customer Phone */}
            <div className="form-group">
              <label className="label">Customer Phone Number</label>
              <input
                type="tel"
                className="input-large"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter phone number (E.g., 9981435014)"
                required
                maxLength={15}
              />
            </div>

            {/* Optional Message */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="label">Message (Optional)</label>
              <textarea
                className="input-large"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a custom message"
              />
            </div>

            {/* Live Preview */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <div className="preview-label">Message Preview:</div>
              <div className="preview-card">
                <div className="preview-box">{previewMessage}</div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="actions-row">
            <div className="action-col">
              <button
                type="button"
                className="btn-send"
                onClick={handleSend}
              >
                Send via WhatsApp
              </button>
            </div>

            <div className="action-col">
              <button
                type="button"
                className="btn-ghost"
                onClick={handleSaveCustomer}
              >
                Save to Customers List
              </button>
            </div>
          </div>
        </form>
      </div>

      {toast && <div className="toast-confirmation">{toastMsg}</div>}
    </div>
  );
}

export default SendRequest;
