import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Mic, CalendarCheck, X } from "lucide-react";

const BookAppointment = () => {
  const doctorId = localStorage.getItem("doctorId");
  const FIXED_USER_ID = "68dfcd1afe1144a21f7ced5f";

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientProblem: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Voice Booking states
  const [voiceModal, setVoiceModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState("en");
  const [voiceStep, setVoiceStep] = useState(0); // 0: select language, 1:name,2:age,3:problem
  const [voiceOutput, setVoiceOutput] = useState({
    patientName: "",
    patientAge: "",
    patientProblem: "",
  });
  const [voiceTranslated, setVoiceTranslated] = useState({
    patientName: "",
    patientAge: "",
    patientProblem: "",
  });
  const silenceTimer = useRef(null);

  // Original form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmBooking = async (dataToSend = null) => {
    setLoading(true);

    const payload = dataToSend || {
      doctorId,
      userId: FIXED_USER_ID,
      patientName: formData.patientName,
      patientAge: formData.patientAge,
      patientProblem: formData.patientProblem,
      patientStatus: "inProcess",
    };

    try {
      const res = await fetch(
        "https://clinic-world.onrender.com/doctors/book-appointment-for-patinet",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (result.success) {
        toast.success(
          `Appointment #${result.data.appointmentNumber} booked for ${result.data.patientName}`,
          { duration: 10000 }
        );
      } else {
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      toast.error("Server error: " + error.message);
    } finally {
      setLoading(false);
      setShowModal(false);
      setVoiceModal(false);
      setFormData({ patientName: "", patientAge: "", patientProblem: "" });
      setVoiceOutput({ patientName: "", patientAge: "", patientProblem: "" });
      setVoiceTranslated({ patientName: "", patientAge: "", patientProblem: "" });
      setVoiceStep(0);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition. Use Chrome!");
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

      // Save to corresponding field
      if (voiceStep === 1) setVoiceOutput((prev) => ({ ...prev, patientName: transcript.trim() }));
      if (voiceStep === 2) setVoiceOutput((prev) => ({ ...prev, patientAge: transcript.trim() }));
      if (voiceStep === 3) setVoiceOutput((prev) => ({ ...prev, patientProblem: transcript.trim() }));

      resetSilenceTimer();

      const translatedText = await translateToIndianEnglish(transcript, language);
      if (voiceStep === 1) setVoiceTranslated((prev) => ({ ...prev, patientName: translatedText }));
      if (voiceStep === 2) setVoiceTranslated((prev) => ({ ...prev, patientAge: translatedText }));
      if (voiceStep === 3) setVoiceTranslated((prev) => ({ ...prev, patientProblem: translatedText }));
    };

    recog.onerror = (event) => console.error("Speech recognition error:", event.error);

    recog.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimer.current);
      // Move to next step automatically
      if (voiceStep >= 1 && voiceStep < 3) setVoiceStep((prev) => prev + 1);
    };

    setRecognition(recog);
  }, [language, voiceStep]);

  const startListening = () => {
    if (!recognition || isListening) return;
    recognition.lang = `${language}-${language.toUpperCase()}`;
    recognition.start();
    setIsListening(true);
    startSilenceTimer();
  };

  const stopListening = () => {
    if (!recognition) return;
    recognition.stop();
    clearTimeout(silenceTimer.current);
  };

  const startSilenceTimer = () => {
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(stopListening, 5000);
  };

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimer.current);
    startSilenceTimer();
  };

  const translateToIndianEnglish = async (text, sourceLang) => {
    if (!text || sourceLang === "en") return text;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|en`;
      const res = await fetch(url);
      const data = await res.json();
      return data.responseData.translatedText || "[Translation Error]";
    } catch (err) {
      console.error("Translation error:", err);
      return "[Translation Error]";
    }
  };

  const handleVoiceBooking = () => setVoiceModal(true);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-blue-50 via-indigo-100 to-white p-6">
      <Toaster position="top-center" />

      {/* Regular Form */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl w-full max-w-md p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="flex justify-center mb-4">
          <CalendarCheck className="text-blue-600 w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2 tracking-tight">
          Book Appointment
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Fill in your details to schedule a consultation
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Patient Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-300 outline-none bg-white/60 placeholder-gray-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Age</label>
            <input
              type="number"
              placeholder="Enter age"
              required
              value={formData.patientAge}
              onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-300 outline-none bg-white/60 placeholder-gray-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Problem (Optional)</label>
            <textarea
              placeholder="Describe symptoms or reason for visit"
              value={formData.patientProblem}
              onChange={(e) => setFormData({ ...formData, patientProblem: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-300 outline-none bg-white/60 placeholder-gray-400 transition-all resize-y min-h-[90px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Review Appointment
            </button>
            <button
              type="button"
              onClick={handleVoiceBooking}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-100 text-blue-700 font-medium rounded-xl hover:bg-blue-200 transition-all"
            >
              <Mic className="w-4 h-4" />
              Voice Booking
            </button>
          </div>
        </form>
      </div>

      {/* Voice Booking Modal */}
      {voiceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 text-center animate-scaleIn relative">
            <button
              onClick={() => setVoiceModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            {voiceStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-700">Select Language</h3>
                <select
                  className="w-full p-3 rounded-xl border border-gray-300"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                  {/* Add more as needed */}
                </select>
                <button
                  onClick={() => setVoiceStep(1)}
                  className="mt-3 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Start Voice Booking
                </button>
              </div>
            )}

            {voiceStep >= 1 && voiceStep <= 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-700">
                  {voiceStep === 1
                    ? "Please speak your Name"
                    : voiceStep === 2
                    ? "Please speak your Age"
                    : "Please describe your Problem (optional)"}
                </h3>
                <button
                  onClick={startListening}
                  className={`flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded-xl font-medium ${
                    isListening ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  {isListening ? "Listening..." : "Start Speaking"}
                </button>

                <div className="flex gap-4 mt-4 justify-between text-left">
                  <div className="w-1/2 p-3 border rounded-xl bg-gray-50">
                    <h4 className="font-semibold text-gray-700">Your Speech</h4>
                    <p>{voiceStep === 1 ? voiceOutput.patientName : voiceStep === 2 ? voiceOutput.patientAge : voiceOutput.patientProblem}</p>
                  </div>
                  <div className="w-1/2 p-3 border rounded-xl bg-gray-50">
                    <h4 className="font-semibold text-gray-700">Indian English</h4>
                    <p>{voiceStep === 1 ? voiceTranslated.patientName : voiceStep === 2 ? voiceTranslated.patientAge : voiceTranslated.patientProblem}</p>
                  </div>
                </div>

                {voiceStep === 3 && (
                  <div className="flex justify-center gap-3 mt-4">
                    <button
                      onClick={() => setVoiceStep(1)}
                      className="px-6 py-2.5 rounded-xl bg-yellow-400 text-white font-semibold hover:bg-yellow-500"
                    >
                      Edit Info
                    </button>
                    <button
                      onClick={() =>
                        confirmBooking({
                          doctorId,
                          userId: FIXED_USER_ID,
                          patientName: voiceTranslated.patientName,
                          patientAge: voiceTranslated.patientAge,
                          patientProblem: voiceTranslated.patientProblem,
                          patientStatus: "inProcess",
                        })
                      }
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                    >
                      {loading ? "Booking..." : "Submit"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in; }
      `}</style>
    </div>
  );
};

export default BookAppointment;
