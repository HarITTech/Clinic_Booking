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
import { useNavigate } from "react-router-dom"; // ✅ Added for redirect

const VoiceBooking = () => {
    const navigate = useNavigate(); // ✅ initialize navigate
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

    // Initialize speech recognition
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
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|en`;
            const res = await fetch(url);
            const data = await res.json();
            return data.responseData.translatedText || "[Translation Error]";
        } catch (err) {
            console.error("Translation error:", err);
            return "[Translation Error]";
        }
    };

    // Timer logic
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

    // Handle confirmation after each voice input
    const handleVoiceConfirm = () => {
        if (!editingField) {
            if (step === "name") {
                if (!translated.trim()) return toast.error("Please say your name!");
                setFormData((prev) => ({ ...prev, patientName: translated.trim() }));
                toast.success("Name recorded!");
                setStep("age");
            } else if (step === "age") {
                if (!translated.trim()) return toast.error("Please say your age!");
                const age = translated.match(/\d+/)?.[0] || translated;
                setFormData((prev) => ({ ...prev, patientAge: age }));
                toast.success("Age recorded!");
                setStep("problem");
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

        // ✅ Always clear previous text after confirm
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

            //   if (response.ok) {
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

                // ✅ Redirect to main booking page after success
                // setTimeout(() => {
                //   navigate("/book");
                // }, 200);
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
            return `Re-speak your ${editingField
                .replace("patient", "")
                .toLowerCase()}`;
        }
        if (step === "name") return "Please say your full name";
        if (step === "age") return "Please say your age";
        return "Please describe your problem (optional)";
    };

    const handlePopupClose = () => {
        setSuccessPopup(null);
        // window.location.href = "/"; // redirect to main page
        // ✅ Redirect to main booking page after success
        setTimeout(() => {
            navigate("/book");
        }, 200);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 px-6 py-10 relative">
            <Toaster position="top-center" />

            {/* ✅ Back Button */}
            <button
                onClick={() => navigate("/book")}
                className="absolute top-5 left-5 flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>

            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 relative">
                <h2 className="text-2xl font-semibold text-center text-purple-700 mb-6 flex items-center justify-center gap-2">
                    <Volume2 className="w-6 h-6" /> Voice Appointment Booking
                </h2>

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
                            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {(step !== "language" && step !== "review") || editingField ? (
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">
                            {getActiveTitle()}
                        </h3>

                        <motion.div
                            animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className={`inline-flex items-center justify-center w-20 h-20 rounded-full shadow-lg mb-4 ${isListening ? "bg-red-500" : "bg-purple-600"
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
                            <p className="font-medium text-purple-700">Heard:</p>
                            <p>{output}</p>
                            <p className="font-medium text-green-700 mt-2">Translated:</p>
                            <p>{translated}</p>
                        </div>

                        <div className="flex justify-center gap-3 mt-5">
                            <button
                                onClick={startListening}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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
                ) : null}

                {step === "review" && !editingField && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-center text-purple-700 mb-3">
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
                                            setTranslated(""); // ✅ clear old speech when editing
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Age</p>
                                <div className="flex items-center justify-between border p-2 rounded-lg">
                                    <span>{formData.patientAge}</span>
                                    <Pencil
                                        size={16}
                                        className="cursor-pointer text-gray-500"
                                        onClick={() => {
                                            setEditingField("patientAge");
                                            setStep("edit");
                                            setOutput("");
                                            setTranslated("");
                                        }}
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
                            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 mt-4 flex items-center justify-center gap-2"
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

            {/* ✅ Success Popup */}
            {successPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-96 text-center relative">
                        <h2 className="text-xl font-semibold text-green-600 mb-3">
                            ✅ {successPopup.message}
                        </h2>
                        <p className="text-gray-700 mb-1">
                            <strong>Appointment No:</strong> {successPopup.appointmentNumber}
                        </p>
                        <p className="text-gray-700 mb-1">
                            <strong>Patient:</strong> {successPopup.patientName}
                        </p>
                        <p className="text-gray-700 mb-1">
                            <strong>Age:</strong> {successPopup.patientAge}
                        </p>
                        {/* <p className="text-gray-700 mb-4">
              <strong>Date:</strong> {successPopup.appointmentDate}
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
    );
};

export default VoiceBooking;
