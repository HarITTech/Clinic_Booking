import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Mic, CalendarCheck } from "lucide-react";
import ConfirmAppointment from "./ConfirmAppointment";

const BookAppointment = () => {
  const doctorId = localStorage.getItem("doctorId");
  const FIXED_USER_ID = "68dfcd1afe1144a21f7ced5f";

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientProblem: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patientName, patientAge, patientProblem } = formData;

    if (!patientName || !patientAge || !patientProblem) {
      toast.error("Please fill all fields.");
      return;
    }

    setShowConfirm(true);
  };

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://clinic-world.onrender.com/doctors/book-appointment-for-patinet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          userId: FIXED_USER_ID,
          patientName: formData.patientName,
          patientAge: formData.patientAge,
          patientProblem: formData.patientProblem,
        }),
      });

      if (response.ok) {
        toast.success("Appointment booked successfully!");
        setFormData({ patientName: "", patientAge: "", patientProblem: "" });
      } else {
        toast.error("Failed to book appointment.");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 px-6 py-10">
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6 flex items-center justify-center gap-2">
          <CalendarCheck className="w-6 h-6" />
          Book Appointment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="patientAge"
              value={formData.patientAge}
              onChange={handleChange}
              placeholder="Enter age"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
            <textarea
              name="patientProblem"
              value={formData.patientProblem}
              onChange={handleChange}
              placeholder="Describe the issue"
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>

          <a
            href="/voice-booking"
            className="flex items-center justify-center gap-2 text-blue-600 font-medium hover:underline"
          >
            <Mic className="w-4 h-4" /> Voice Booking
          </a>
        </form>
      </div>

      {showConfirm && (
        <ConfirmAppointment
          formData={formData}
          onConfirm={confirmBooking}
          onCancel={() => setShowConfirm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default BookAppointment;
