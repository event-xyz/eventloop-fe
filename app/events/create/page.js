"use client";

import { Loading } from "@/components/ui/loading";
import { useState, useEffect } from "react";

export default function CreateEvent() {
  const [name, setName] = useState("");
  const [event_date, setEventDate] = useState("");
  const [max_participants, setParticipants] = useState(0);
  const [loading, setLoading] = useState(false);

  // sets title only after registering a user interaction. to be fixed
  useEffect(() => {
    document.title = 'Create Event | Eventloop';
  })

  function setMaxParticipants(value) {
    setParticipants(parseInt(value, 10))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newEvent = { name, event_date, max_participants };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newEvent),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Event Created: ${data.event_id}\nForm link: ${window.location.hostname}/forms/${data.form_id}/submit`);
      } else {
        alert("Error creating event: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6">Get started with creating an event!</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Event Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                id="event_date"
                type="date"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={event_date}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                Max Participants
              </label>
              <input
                id="max_participants"
                type="number"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={max_participants}
                onChange={(e) => {if(e.target.value > 0) setMaxParticipants(e.target.value)}}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? <Loading state="submitting" /> : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};