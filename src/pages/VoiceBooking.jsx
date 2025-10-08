import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Mic,
  MicOff,
  Volume2,
  Pencil,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import ConfirmAppointment from "./ConfirmAppointment";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DoctorAppointments from "../components/DoctorAppointments";

const VoiceBooking = () => {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");
  const FIXED_USER_ID = "68dfcd1afe1144a21f7ced5f";

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState("en");
  const [output, setOutput] = useState("");
  const [translated, setTranslated] = useState("");
  const silenceTimer = useRef(null);

  const [step, setStep] = useState("language");
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientProblem: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Your browser does not support Speech Recognition. Use Chrome!");
      return;
    }

    const recog = new window.webkitSpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;

    recog.onresult = async (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setOutput(transcript);
      resetSilenceTimer();
      const translatedText = await translateToIndianEnglish(transcript, language);
      setTranslated(translatedText);
    };

    recog.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error("Speech recognition error: " + event.error);
    };

    recog.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimer.current);
    };

    setRecognition(recog);
  }, [language]);

  const translateToIndianEnglish = async (text, sourceLang) => {
    if (!text || sourceLang === "en") return text;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${sourceLang}|en`;
      const res = await fetch(url);
      const data = await res.json();
      return data.responseData.translatedText || "[Translation Error]";
    } catch (err) {
      console.error("Translation error:", err);
      return "[Translation Error]";
    }
  };

  const startSilenceTimer = () => {
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      stopListening();
    }, 5000);
  };

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimer.current);
    startSilenceTimer();
  };

  const startListening = () => {
    if (!recognition || isListening) return;
    recognition.lang = `${language}-${language.toUpperCase()}`;
    recognition.start();
    setIsListening(true);
    setOutput("Listening...");
    setTranslated("");
    startSilenceTimer();
  };

  const stopListening = () => {
    if (!recognition) return;
    recognition.stop();
    clearTimeout(silenceTimer.current);
  };

  const handleVoiceConfirm = () => {
    if (!editingField) {
      if (step === "name") {
        if (!translated.trim()) return toast.error("Please say your name!");
        setFormData((prev) => ({ ...prev, patientName: translated.trim() }));
        toast.success("Name recorded!");
        setStep("age"); // move to keyboard input step
      } else if (step === "problem") {
        setFormData((prev) => ({ ...prev, patientProblem: translated.trim() }));
        toast.success("Problem noted (optional)!");
        setStep("review");
      }
    } else {
      if (!translated.trim()) return toast.error("Please speak something to update!");
      const updated = translated.trim();
      setFormData((prev) => ({
        ...prev,
        [editingField]: updated,
      }));
      toast.success(`${editingField.replace("patient", "")} updated!`);
      setEditingField(null);
      setStep("review");
    }

    setOutput("");
    setTranslated("");
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
            ...formData,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Appointment booked successfully!");
        setSuccessPopup({
          message: result.message,
          appointmentNumber: result.data.appointmentNumber,
          patientName: result.data.patientName,
          patientAge: result.data.patientAge,
        });
        setFormData({ patientName: "", patientAge: "", patientProblem: "" });
      } else {
        toast.error("Booking failed.");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setStep("language");
    }
  };

  const getActiveTitle = () => {
    if (editingField) {
      return `Re-speak your ${editingField.replace("patient", "").toLowerCase()}`;
    }
    if (step === "name") return "Please say your full name";
    if (step === "problem") return "Please describe your problem (optional)";
    return "";
  };

  const handlePopupClose = () => {
    setSuccessPopup(null);
    setTimeout(() => {
      navigate("/book");
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 px-6 py-10 relative w-full">
      <Toaster position="top-center" />

      {/* ✅ Back Button */}
      <button
        onClick={() => navigate("/book")}
        className="absolute top-5 left-5 flex items-center gap-1 text-[#005399] hover:text-[#005399] font-medium transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back/Booking
      </button>

      <div className="flex flex-col md:flex-row justify-center md:justify-around items-start w-full gap-5 lg:gap-1 py-10">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 relative">
            <h2 className="text-xl lg:text-2xl font-semibold text-center text-[#005399] mb-6 flex items-center justify-center gap-2">
              <Volume2 className="w-8 h-8" /> Voice Appointment Booking
            </h2>

            {/* Language selection */}
            {step === "language" && (
              <div className="text-center">
                <p className="text-gray-700 mb-3 font-medium">Select your language:</p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                </select>
                <button
                  onClick={() => setStep("name")}
                  className="mt-4 bg-[#005399] text-white px-4 py-2 rounded-lg hover:bg-[#004882]"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Voice input steps for name & problem */}
            {(step === "name" || step === "problem" || editingField) && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  {getActiveTitle()}
                </h3>

                <motion.div
                  animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg mb-4 ${
                    isListening ? "bg-red-500" : "bg-[#005399]"
                  }`}
                >
                  {isListening ? (
                    <MicOff
                      className="w-8 h-8 text-white cursor-pointer"
                      onClick={stopListening}
                    />
                  ) : (
                    <Mic
                      className="w-8 h-8 text-white cursor-pointer"
                      onClick={startListening}
                    />
                  )}
                </motion.div>

                <div className="text-sm text-gray-600">
                  <p className="font-medium text-[#005399]">Heard:</p>
                  <p>{output}</p>
                  <p className="font-medium text-green-700 mt-2">Translated:</p>
                  <p>{translated}</p>
                </div>

                <div className="flex justify-center gap-3 mt-5">
                  <button
                    onClick={startListening}
                    className="bg-[#005399] text-white px-4 py-2 rounded-lg hover:bg-[#003968]"
                  >
                    Re-speak
                  </button>
                  <button
                    onClick={handleVoiceConfirm}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* Keyboard input for age */}
            {step === "age" && (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  Please enter your age (Numbers only)
                </h3>
                <input
                  type="number"
                  min="1"
                  value={formData.patientAge}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, patientAge: e.target.value }))
                  }
                  placeholder="Enter your age"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center"
                />
                <button
                  onClick={() => {
                    if (!formData.patientAge.trim()) {
                      toast.error("Please enter your age!");
                      return;
                    }
                    setStep("problem");
                  }}
                  className="bg-[#005399] text-white px-4 py-2 rounded-lg hover:bg-[#004882]"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Review section */}
            {step === "review" && !editingField && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-center text-[#005399] mb-3">
                  Review Your Details
                </h3>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <div className="flex items-center justify-between border p-2 rounded-lg">
                      <span>{formData.patientName}</span>
                      <Pencil
                        size={16}
                        className="cursor-pointer text-gray-500"
                        onClick={() => {
                          setEditingField("patientName");
                          setStep("edit");
                          setOutput("");
                          setTranslated("");
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <div className="flex items-center justify-between border p-2 rounded-lg">
                      <span>{formData.patientAge}</span>
                      {/* No edit for age by voice, just input manually */}
                      <Pencil
                        size={16}
                        className="cursor-pointer text-gray-500"
                        onClick={() =>
                          toast("You can directly edit age in input field.")
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Problem (Optional)</p>
                    <div className="flex items-center justify-between border p-2 rounded-lg">
                      <span>{formData.patientProblem || "No problem specified"}</span>
                      <Pencil
                        size={16}
                        className="cursor-pointer text-gray-500"
                        onClick={() => {
                          setEditingField("patientProblem");
                          setStep("edit");
                          setOutput("");
                          setTranslated("");
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full bg-[#005399] text-white py-2 rounded-lg hover:bg-[#003662] mt-4 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Review & Confirm
                </button>
              </div>
            )}
          </div>

          {showConfirm && (
            <ConfirmAppointment
              formData={formData}
              onConfirm={confirmBooking}
              onCancel={() => setShowConfirm(false)}
              loading={loading}
            />
          )}

          {/* Success popup */}
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

                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={handlePopupClose}
                    className="bg-[#005399] text-white px-4 py-2 rounded-lg hover:bg-[#004176] transition"
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

export default VoiceBooking;
