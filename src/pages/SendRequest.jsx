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
      : `Hi ${name}, You recently visited, please leave a review for\n${businessName}\n${trackedGoogleLink}`;
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
    <div className="container py-4">
      <h1 className="mb-3 text-center">Send Review Request</h1>
      <form>
        {/* Customer Name */}
        <div className="mb-3">
          <div className=" d-flex justify-content-between align-items-center">
            <label className="form-label">Customer Name</label>
            {/* View Customer List */}
            <div className=" mb-2">
              <button
                type="button"
                className="btn btn-white border border-black border-1 text-primary btn-sm py-0"
                onClick={() => navigate("/customers_list")}
              >
                View Customers List →
              </button>
            </div>
          </div>
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
            placeholder="Enter phone number (E.g., 9981435014)"
            required
            maxLength={15}
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

        {/* Live Preview */}
        <div className="mb-3 preview-message">
          <label className="form-label">Message Preview:</label>
          <div className="preview-box">{previewMessage}</div>
        </div>

        {/* Buttons */}
        <div className="d-flex flex-column gap-3 mt-3">
          <button
            type="button"
            className="btn btn-success btn-lg"
            onClick={handleSend}
          >
            Send via WhatsApp
          </button>

          <button
            type="button"
            className="btn btn-outline-primary btn-lg"
            onClick={handleSaveCustomer}
          >
            Save to Customers List
          </button>
        </div>
      </form>

      {toast && <div className="toast-confirmation">{toastMsg}</div>}
    </div>
  );
}

export default SendRequest;
