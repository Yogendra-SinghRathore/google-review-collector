import React, { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../supabaseClient";
const CustomersList = () => {
  const user = useUser();
  const [customers, setCustomers] = useState([]);

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

  // Send WhatsApp and move to review_requests
  const handleSend = async (customer) => {
    if (!user) return;

    const textMessage = customer.message
      ? customer.message
      : `Hi ${customer.name}, please leave a review!`;

    const waLink = `https://wa.me/${customer.phone}?text=${encodeURIComponent(
      textMessage
    )}`;

    // Save to review_requests
    const { error: insertError } = await supabase.from("review_requests").insert([
      {
        user_id: user.id,
        name: customer.name,
        phone: customer.phone,
        message: textMessage,
        status: "Pending",
      },
    ]);

    if (insertError) {
      console.error("Error moving customer to review_requests:", insertError);
      alert("Failed to send request.");
      return;
    }

    // Remove from customers
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
      <h1 className="mb-4">Customers List</h1>

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
                  <td>
                    {new Date(customer.created_at)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
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

