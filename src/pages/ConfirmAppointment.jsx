import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const ConfirmAppointment = ({ formData, onConfirm, onCancel, loading }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Appointment Details
        </h3>
        <div className="text-gray-700 text-left mb-5 space-y-1">
          <p><strong>Name:</strong> {formData.patientName}</p>
          <p><strong>Age:</strong> {formData.patientAge}</p>
          <p><strong>Problem:</strong> {formData.patientProblem}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? "Confirming..." : "Confirm"}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAppointment;
