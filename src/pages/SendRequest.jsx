import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";
import "./SendRequest.css";

function SendRequest() {
  const user = useUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [waLink, setWaLink] = useState("");
  const [toast, setToast] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");

  const businessPlaceId = "YOUR_BUSINESS_PLACE_ID"; // Replace with your real Place ID

  // Live preview update
  useEffect(() => {
    const reviewLink = `https://search.google.com/local/writereview?placeid=${businessPlaceId}`;
    const text = message
      ? message
      : `Hi ${name || "[Customer Name]"}, please leave us a review!`;
    setPreviewMessage(`${text} ${reviewLink}`);
  }, [name, message]);

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

    const reviewLink = `https://search.google.com/local/writereview?placeid=${businessPlaceId}`;
    const textMessage = message
      ? message
      : `Hi ${name}, please leave us a review!`;
    const encodedMessage = encodeURIComponent(`${textMessage} ${reviewLink}`);
    const link = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodedMessage}`;
    setWaLink(link);

    const { error } = await supabase.from("review_requests").insert([
      {
        user_id: user.id,
        name,
        phone,
        message,
        status: "Pending",
      },
    ]);

    if (error) {
      console.error("Error saving request:", error);
      alert("Failed to save request.");
      return;
    }

    setToast(true);
    setTimeout(() => setToast(false), 3000);
    setName("");
    setPhone("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(waLink);
    alert("WhatsApp link copied to clipboard!");
  };

  // Not signed in
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

        <button type="submit" className="btn btn-primary btn-lg w-100">
          Generate WhatsApp Link
        </button>
      </form>

      {waLink && (
        <div className="mt-4 text-center">
          <p>Click below to send the review request via WhatsApp:</p>
          <div className="d-flex flex-column gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success btn-lg w-100"
            >
              Send via WhatsApp
            </a>
            <button
              className="btn btn-outline-secondary btn-lg w-100"
              onClick={handleCopy}
            >
              Copy WhatsApp Link
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast-confirmation">Request saved successfully!</div>}
    </div>
  );
}

export default SendRequest;
