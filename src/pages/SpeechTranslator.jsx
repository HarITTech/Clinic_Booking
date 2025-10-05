import React, { useState, useEffect, useRef } from "react";

const SpeechTranslator = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState("en");
  const [output, setOutput] = useState("Your speech will appear here...");
  const [translated, setTranslated] = useState("Translation will appear here...");
  const silenceTimer = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition. Use Chrome!");
      return;
    }

    const recog = new window.webkitSpeechRecognition();
    recog.continuous = false; // important: stop auto-restart
    recog.interimResults = true;

    recog.onresult = async (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setOutput(transcript);

      // Reset silence timer whenever speech is detected
      resetSilenceTimer();

      const translatedText = await translateToIndianEnglish(transcript, language);
      setTranslated(translatedText);
    };

    recog.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recog.onend = () => {
      // Recognition stopped
      setIsListening(false);
      clearTimeout(silenceTimer.current);
      setOutput((prev) =>
        prev.includes("[Stopped Listening]")
          ? prev
          : prev + "\n[Stopped Listening]"
      );
    };

    setRecognition(recog);
  }, [language]);

  // Start listening
  const startListening = () => {
    if (!recognition || isListening) return;

    recognition.lang = `${language}-${language.toUpperCase()}`;
    recognition.start();
    setIsListening(true);
    setOutput("Listening...");
    setTranslated("");

    // Start silence timer when listening begins
    startSilenceTimer();
  };

  // Stop listening
  const stopListening = () => {
    if (!recognition) return;
    recognition.stop(); // will trigger onend
    clearTimeout(silenceTimer.current);
  };

  // Timer: auto-stop after 5–6 seconds of silence
  const startSilenceTimer = () => {
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      stopListening();
    }, 5000); // 5 seconds
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

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center p-8 text-center">
      <h2 className="text-2xl font-bold mb-6">🎤 Speech to Text + Translator</h2>

      <div className="mb-4">
        <label htmlFor="language" className="mr-2 text-lg">
          Choose Language:
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#222] text-white border border-[#ff6600] rounded-md px-3 py-2 text-base"
        >
          <option value="en">English (India)</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
          <option value="bn">Bengali</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="gu">Gujarati</option>
          <option value="kn">Kannada</option>
          <option value="ml">Malayalam</option>
          <option value="pa">Punjabi</option>
          <option value="ur">Urdu</option>
        </select>
      </div>

      {/* Start Button Only */}
      <div className="mb-8">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`${
            isListening ? "bg-gray-600 cursor-not-allowed" : "bg-[#ff6600] hover:bg-[#ff3300]"
          } text-white font-semibold px-6 py-2 rounded-md transition-all`}
        >
          {isListening ? "🎧 Listening..." : "🎙 Start Mic"}
        </button>
      </div>

      {/* Output */}
      <div className="w-full max-w-2xl">
        <h3 className="text-xl font-semibold mt-4 mb-2">Original Text:</h3>
        <div className="bg-[#222] border-2 border-[#ff6600] rounded-lg p-4 text-lg min-h-[80px] whitespace-pre-wrap">
          {output}
        </div>

        <h3 className="text-xl font-semibold mt-8 mb-2">Translated (Indian English):</h3>
        <div className="bg-[#222] border-2 border-[#ff6600] rounded-lg p-4 text-lg min-h-[80px] whitespace-pre-wrap">
          {translated}
        </div>
      </div>
    </div>
  );
};

export default SpeechTranslator;
