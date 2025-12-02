import React, { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";
import "./CustomersList.css";

const CustomersList = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [customers, setCustomers] = useState([]);
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

  // Fetch customers
  const fetchCustomers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      return;
    }

    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  // Send & move to review_requests
  const handleSend = async (customer) => {
    if (!user) return;

    const textMessage = customer.message
      ? customer.message
      : `Hi ${customer.name}, you recently visited, please leave a review for\n${businessName}\n${businessLink}`;

    const { data: insertedData, error: insertError } = await supabase
      .from("review_requests")
      .insert([
        {
          user_id: user.id,
          name: customer.name,
          phone: customer.phone,
          message: textMessage,
          status: "Pending",
        },
      ])
      .select("id")
      .single();

    if (insertError || !insertedData) {
      console.error("Error moving customer:", insertError);
      alert("Failed to send request.");
      return;
    }

    const newRequestId = insertedData.id;
    const trackedLink = `https://xpvwpeczbloarigllmra.supabase.co/functions/v1/redirectReview?id=${newRequestId}`;

    const waMessage = customer.message
      ? customer.message
      : `Hi ${customer.name}, you recently visited, please leave a review for\n${businessName}\n${trackedLink}`;

    const waLink = `https://wa.me/${customer.phone}?text=${encodeURIComponent(
      waMessage
    )}`;

    // Remove from table
    await supabase.from("customers").delete().eq("id", customer.id);

    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));

    window.open(waLink, "_blank");
  };

  if (!user) {
    return (
      <div className="cl-center-screen">
        <div className="cl-auth-box">
          <h3 className="cl-auth-title">Please sign in to view customers</h3>

          <button
            className="cl-btn-primary"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cl-container">
      <h1 className="cl-title">Customers List</h1>

      <div className="cl-table-wrapper">
        <table className="cl-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Date Added</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>
                    {new Date(customer.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })
                      .replace(/ /g, "-")}
                  </td>
                  <td>
                    <button
                      className="cl-btn-send"
                      onClick={() => handleSend(customer)}
                    >
                      Send
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="cl-empty">
                  No customers in the list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersList;
