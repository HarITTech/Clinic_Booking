import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Mic, CalendarCheck } from "lucide-react";
import ConfirmAppointment from "./ConfirmAppointment";
import logo from "../assets/logo.png";
import DoctorAppointments from "../components/DoctorAppointments";

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
  const [successPopup, setSuccessPopup] = useState(null); // store success data

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { patientName, patientAge } = formData;

    if (!patientName || !patientAge) {
      toast.error("Please enter patient name and valid age.");
      return;
    }

    if (isNaN(patientAge) || patientAge <= 0) {
      toast.error("Age must be a valid positive number.");
      return;
    }

    setShowConfirm(true);
  };

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://clinic-world.onrender.com/doctors/book-appointment-for-patinet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId,
            userId: FIXED_USER_ID,
            patientName: formData.patientName,
            patientAge: formData.patientAge,
            patientProblem: formData.patientProblem, // optional now
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Appointment booked successfully!");

        // store success data for popup
        setSuccessPopup({
          message: result.message,
          appointmentNumber: result.data.appointmentNumber,
          patientName: result.data.patientName,
          patientAge: result.data.patientAge,
          // appointmentDate: result.data.appointmentDate,
        });

        setFormData({ patientName: "", patientAge: "", patientProblem: "" });
      } else {
        toast.error(result.message || "Failed to book appointment.");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handlePopupClose = () => {
    setSuccessPopup(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-10 px-6 w-full">
      <Toaster position="top-center" />

      <div className="flex flex-col md:flex-row justify-center md:justify-between items-start w-full gap-5 lg:gap-1">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8">
            <h2 className="text-xl lg:text-2xl font-semibold text-center text-[#005399] mb-6 flex items-center justify-center gap-2">
              <img src={logo} alt="O" className="w-[70px] h-[70px]" />
              Book Appointment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Problem (optional)
                </label>
                <textarea
                  name="patientProblem"
                  value={formData.patientProblem}
                  onChange={handleChange}
                  placeholder="Describe the issue (optional)"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#005399] text-white py-2 rounded-lg hover:bg-gray-200 hover:text-[#005399] font-semibold transition"
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>

              <a
                href="/voice-booking"
                className="flex items-center justify-center gap-2 text-[#005399] bg-gray-200 hover:bg-[#005399] hover:text-[#ffffff] font-semibold rounded-lg py-2"
              >
                <Mic className="w-[18px] h-[18px]" /> Voice Booking
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

          {/* ✅ Success Popup */}
          {successPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-8 w-96 text-center relative">
                <h2 className="text-xl font-semibold text-green-600 mb-3">
                  {successPopup.message}
                </h2>
                <p className="mb-2 rounded-lg flex items-center justify-center text-[#005399] text-xl">
                  <strong>Appointment No:</strong> #{successPopup.appointmentNumber}
                </p>
                <p className="mb-1 text-[#005399] text-lg">
                  <strong>Patient:</strong> {successPopup.patientName}
                </p>
                {/* <p className="text-gray-700 mb-1">
                  <strong>Age:</strong> {successPopup.patientAge}
                </p> */}

                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={handlePopupClose}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setSuccessPopup(null)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <DoctorAppointments className="w-1/2" />
      </div>
    </div>
  );
};

export default BookAppointment;
