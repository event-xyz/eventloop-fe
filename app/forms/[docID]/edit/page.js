"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";

const FIELD_TYPES = [
  { label: "Short Text", value: "short_text" },
  { label: "Long Text", value: "long_text" },
  { label: "Image", value: "image" },
  { label: "Select", value: "select" },
  { label: "Radio", value: "radio" },
  { label: "Dropdown", value: "dropdown" },
];

function emptyField(type = "short_text") {
  return {
    label: "",
    type,
    options: ["option 1"],
    required: false,
    value: "",
  };
}

export default function FormEditor() {
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([emptyField()]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const docID = params.docID;

  const router = useRouter();

  useEffect(() => {
    if (docID) {
      // Fetch the existing form data from the backend
      console.log(docID);
      const fetchFormData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/forms/${docID}`,
            { credentials: "include" }
          );
          const data = await response.json();

          if (response.status == 401) return router.push("/");
          if (response.ok) {
            handleTitleChange(data.title);
            setFields(data.fields);
          } else {
            alert("Failed to load form");
          }
        } catch (error) {
          alert("An error occurred while loading the form");
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFormData();
    }
  }, [docID, router]);

  const handleTitleChange = (value) => {
    setTitle(value);
    document.title = `${value} | Eventloop`;
  }

  const handleFieldChange = (idx, key, value) => {
    setFields((fields) =>
      fields.map((f, i) => (i === idx ? { ...f, [key]: value } : f))
    );
  };

  const handleTypeChange = (idx, type) => {
    setFields((fields) =>
      fields.map((f, i) =>
        i === idx
          ? {
              ...emptyField(type),
              label: f.label,
              required: f.required,
            }
          : f
      )
    );
  };

  const handleOptionChange = (idx, optIdx, value) => {
    setFields((fields) =>
      fields.map((f, i) =>
        i === idx
          ? {
              ...f,
              options: f.options.map((opt, oi) =>
                oi === optIdx ? value : opt
              ),
            }
          : f
      )
    );
  };

  const addOption = (idx) => {
    setFields((fields) =>
      fields.map((f, i) =>
        i === idx
          ? { ...f, options: [...f.options, `option ${f.options.length + 1}`] }
          : f
      )
    );
  };

  const removeOption = (idx, optIdx) => {
    setFields((fields) =>
      fields.map((f, i) =>
        i === idx
          ? { ...f, options: f.options.filter((_, oi) => oi !== optIdx) }
          : f
      )
    );
  };

  const addField = () => setFields([...fields, emptyField()]);
  const removeField = (idx) =>
    setFields((fields) => fields.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Create the form data object
    const formData = {
      id: decodeURIComponent(docID),
      title,
      fields: fields.map((field) => ({
        label: field.label,
        type: field.type,
        options: field.options,
        required: field.required,
      })),
    };

    try {
      // Send form data to the backend for update
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/forms/${docID}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("Form updated successfully!");
      } else {
        alert("Failed to update form");
      }
    } catch (error) {
      alert("An error occurred while updating the form");
      console.error("Error:", error);
    }

    setSubmitting(false);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Form Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />

        {fields.map((field, idx) => (
          <div key={idx} className="border rounded p-4 mb-4 bg-white shadow">
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Field Label"
                value={field.label}
                onChange={(e) =>
                  handleFieldChange(idx, "label", e.target.value)
                }
                required
              />
              <select
                className="border p-2 rounded"
                value={field.type}
                onChange={(e) => handleTypeChange(idx, e.target.value)}
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-red-500"
                onClick={() => removeField(idx)}
                title="Remove field"
              >
                &times;
              </button>
            </div>

            {/* Field-specific controls */}
            {["select", "radio", "dropdown"].includes(field.type) && (
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">
                  Options
                </label>
                {field.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex gap-2 mb-1">
                    <input
                      className="flex-1 border p-1 rounded"
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(idx, optIdx, e.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => removeOption(idx, optIdx)}
                      disabled={field.options.length <= 1}
                      title="Remove option"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-blue-600 text-sm"
                  onClick={() => addOption(idx)}
                >
                  + Add Option
                </button>
              </div>
            )}

            {field.type === "short_text" && (
              <input
                className="w-full border p-2 rounded"
                placeholder="Short text answer (max 200 chars)"
                maxLength={200}
                disabled
              />
            )}

            {field.type === "long_text" && (
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Long text answer (max 5000 chars)"
                maxLength={5000}
                rows={3}
                disabled
              />
            )}

            {field.type === "image" && (
              <input
                type="file"
                accept="image/*"
                className="w-full border p-2 rounded"
                disabled
              />
            )}

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  handleFieldChange(idx, "required", e.target.checked)
                }
                id={`required-${idx}`}
              />
              <label htmlFor={`required-${idx}`}>Required</label>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={addField}
        >
          + Add Field
        </button>

        <div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded"
            disabled={submitting}
          >
            {submitting ? <Loading state="submitting"/> : "Save Form"}
          </button>
        </div>
      </form>
    </div>
  );
}
