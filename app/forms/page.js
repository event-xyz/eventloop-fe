"use client";

import { Loading } from "@/components/ui/loading";
import { useEffect, useState } from "react";

export default function FormsPage() {
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
        ); // Adjust this URL to your API
        const data = await response.json();
        setForms(data.forms);
        document.title = 'Form Manager | Eventloop';
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
    return <div>{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Form Management</h1>
      {forms.length === 0 || !forms ? (
        <p className="text-xl text-center text-gray-500">No forms available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Form Title</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => {
                // Access the actual form data which is inside the 'forms' key
                return (
                  <tr key={form.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{form.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-4">
                        <a
                          href={`/forms/${form.id}/edit`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit Form
                        </a>
                        <a
                          href={`/forms/${form.id}/viewResponses`}
                          className="text-blue-600 hover:underline"
                        >
                          View Responses
                        </a>
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
