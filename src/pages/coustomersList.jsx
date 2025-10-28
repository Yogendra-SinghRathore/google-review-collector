import React, { useState, useEffect } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";

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

  // Fetch customers from Supabase
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

  // Send WhatsApp message and move to review_requests
  const handleSend = async (customer) => {
    if (!user) return;

    // Build default message if customer.message is empty
    const textMessage = customer.message
      ? customer.message
      : `Hi ${customer.name}, you recently visited, please leave a review for\n${businessName}\n${businessLink}`;

    // Save to review_requests and get the new id
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
      console.error("Error moving customer to review_requests:", insertError);
      alert("Failed to send request.");
      return;
    }

    const newRequestId = insertedData.id;

    // WhatsApp link with tracking Edge Function URL in the message
    const trackedGoogleLink = `https://xpvwpeczbloarigllmra.supabase.co/functions/v1/redirectReview?id=${newRequestId}`;
    const waMessage = customer.message
      ? customer.message
      : `Hi ${customer.name}, you recently visited, please leave a review for\n${businessName}\n${trackedGoogleLink}`;
    const waLink = `https://wa.me/${customer.phone}?text=${encodeURIComponent(
      waMessage
    )}`;

    // Remove from customers table
    const { error: deleteError } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error removing customer from list:", deleteError);
    }

    // Optimistic UI update
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));

    // Open WhatsApp
    window.open(waLink, "_blank");
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h3>Please sign in to view customers</h3>
          <button
            className="btn btn-primary mt-3"
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
    <div className="container py-4">
      <h1 className="mb-3">Customers List</h1>

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
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
                  <td className=" text-center">
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
                      className="btn btn-sm btn-success"
                      onClick={() => handleSend(customer)}
                    >
                      Send
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
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
