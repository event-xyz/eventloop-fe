"use client";

import { Loading } from "@/components/ui/loading";
import { useEffect, useState } from "react";

export default function RegisteredForms() {
  const [forms, setForms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch forms from the backend
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/forms/`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.forms) {
          setForms(data.forms);
        } else {
          setError("No forms available.");
        }
        document.title = "Registered Events | Eventloop";
      } catch (err) {
        setError("Failed to fetch forms");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
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
    return formattedDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    }).split(" GMT")[0];
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Registered Forms</h1>
      {Object.keys(forms).length === 0 ? (
        <p className="text-xl text-center text-gray-500">No forms available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Form Title</th>
                <th className="px-4 py-3 text-left">Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(forms).map((key) => {
                const form = forms[key]; // Extract form object by key
                return (
                  <tr key={form.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{form.docID.split("_")[0]}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-4">
                        <p>{formatTimestamp(form.docID.split("_")[1])}</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
