"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";

// This component will be used to display all responses for a given form
export default function ViewResponses() {
  const [responses, setResponses] = useState([]); // Store the form responses
  const [form, setForm] = useState(null); // Store the form data (field names)
  const [loading, setLoading] = useState(true); // Loading state for responses fetch
  const [error, setError] = useState(null); // Error state for any fetching issues

  const params = useParams();
  const formID = params.docID;

  const router = useRouter();

  // Fetch the form data and responses for the form based on formID
  useEffect(() => {
    if (!formID) return;

    const fetchFormData = async () => {
      try {
        // Fetch the form details to get field labels
        const formResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forms/${formID}`,
          { credentials: "include" }
        );

        if (formResponse.status === 401) return router.push("/");

        const formData = await formResponse.json();
        setForm(formData); // Store the form fields (labels)
      } catch (error) {
        console.error("Error fetching form data:", error);
        setError("Failed to fetch form data.");
        setLoading(false);
      }
    };

    const fetchResponses = async () => {
      try {
        // Fetch the responses based on formID
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forms/${formID}/responses`,
          { credentials: "include" }
        );

        if (response.status === 401) return router.push("/");

        const data = await response.json();
        console.log(data.responses);
        setResponses(data.responses || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching responses:", error);
        setError("Failed to fetch responses.");
        setLoading(false);
      }
    };

    fetchFormData();
    fetchResponses();
  }, [formID, router]);

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <div>{error}</div>;
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return;
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const minute = timestamp.slice(10, 12);
    const second = timestamp.slice(12, 14);

    // Create a new Date object using the extracted parts
    const formattedDate = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
    ).toUTCString();

    // Format the date using toLocaleString() for a human-readable format
    return formattedDate
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
      })
      .split(" GMT")[0];
  };

  // Render the responses dynamically based on the response object and field labels
  const renderResponse = (response, idx) => {
    const time = response.id.split("_")[1];
    console.log(time);
    return (
      <div key={idx} className="border p-4 rounded-lg shadow-md mb-4">
        <h2 className="font-semibold">
          {response.id.split("_")[0] || "No ID available"}
        </h2>
        <h3>{formatTimestamp(time)}</h3>
        <div className="space-y-4 mt-4">
          {form?.fields.map((field, fieldIdx) => {
            // Find the corresponding response for this field by accessing response.response[fieldIdx]
            const fieldResponse =
              response.response?.[fieldIdx] || "No response provided";

            return (
              <div key={fieldIdx}>
                <h3 className="font-medium">{field.label}</h3>
                <p>{fieldResponse}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">
        {decodeURIComponent(formID).split("_")[0]}
      </h1>
      <h2 className="mb-4">
        {formatTimestamp(decodeURIComponent(formID).split("_")[1])}
      </h2>
      {responses.length === 0 ? (
        <p>No responses found.</p>
      ) : (
        <div className="space-y-6">
          {responses.map((response, idx) => renderResponse(response, idx))}
        </div>
      )}
    </div>
  );
}
