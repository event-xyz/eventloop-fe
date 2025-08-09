"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";

export default function ServeForm() {
  const [form, setForm] = useState(null); // Store the fetched form data
  const [response, setResponse] = useState({}); // Store the respondent's responses
  const [loading, setLoading] = useState(true); // Loading state for form fetch
  const [submitting, setSubmitting] = useState(false);

  const params = useParams();
  const docID = params.docID;

  const router = useRouter();

  // Fetch the form data using docID
  useEffect(() => {
    if (!docID) return;

    const fetchForm = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forms/${docID}`,
          { credentials: "include" }
        );
        if (response.status == 401) return router.push("/");

        const data = await response.json();
        document.title = `${data.title} | Eventloop`;
        setForm(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching form:", error);
        setLoading(false);
      }
    };

    fetchForm();
  }, [docID, router]);

  // Handle change in input field (store responses)
  const handleFieldChange = (idx, value) => {
    setResponse((prev) => ({
      ...prev,
      [idx]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = {
      docID,
      response,
    };

    try {
      // Submit the form responses to the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forms/${docID}/submit_response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("Your response has been submitted!");
      } else {
        alert("Failed to submit your responses.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting your form.");
    }

    setSubmitting(false);

    router.push(`${window.location.hostname}/applicationStatus/${formData.docID}`);
  };

  // Render the form fields dynamically based on the form data
  const renderField = (field, idx) => {
    switch (field.type) {
      case "short_text":
        return (
          <div key={idx} className="border rounded p-4 mb-4 bg-white shadow">
            <label className="block text-sm font-medium mb-2">
              {field.label}
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Enter your response"
              value={response[idx] || ""}
              onChange={(e) => handleFieldChange(idx, e.target.value)}
              required={field.required}
            />
          </div>
        );
      case "long_text":
        return (
          <div key={idx} className="border rounded p-4 mb-4 bg-white shadow">
            <label className="block text-sm font-medium mb-2">
              {field.label}
            </label>
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Enter your response"
              value={response[idx] || ""}
              onChange={(e) => handleFieldChange(idx, e.target.value)}
              required={field.required}
              rows={4}
            />
          </div>
        );
      case "select":
      case "dropdown":
        return (
          <div key={idx} className="border rounded p-4 mb-4 bg-white shadow">
            <label className="block text-sm font-medium mb-2">
              {field.label}
            </label>
            <select
              className="w-full border p-2 rounded"
              value={response[idx] || ""}
              onChange={(e) => handleFieldChange(idx, e.target.value)}
              required={field.required}
            >
              {field.options.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case "radio":
        return (
          <div key={idx} className="border rounded p-4 mb-4 bg-white shadow">
            <label className="block text-sm font-medium mb-2">
              {field.label}
            </label>
            {field.options.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${idx}-${i}`}
                  name={idx}
                  value={option}
                  checked={response[idx] === option}
                  onChange={() => handleFieldChange(idx, option)}
                  className="mr-2"
                />
                <label htmlFor={`${idx}-${i}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case "image":
        return (
          <div key={idx} className="border rounded p-4 mb-4 bg-white shadow">
            <label className="block text-sm font-medium mb-2">
              {field.label}
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border p-2 rounded"
              onChange={(e) => handleFieldChange(idx, e.target.files[0])}
              required={field.required}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{form.title}</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        encType="multipart/form-data"
      >
        {form.fields.map((field, idx) => renderField(field, idx))}

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded"
          disabled={submitting}
        >
          {submitting ? "Submitting" && <Loading state="submitting" /> : "Submit Form"}
        </button>
      </form>
    </div>
  );
}
