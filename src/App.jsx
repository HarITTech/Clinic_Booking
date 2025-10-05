import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import BookAppointment from "./pages/BookAppointment";
import ProtectedRoute from "./router/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import SpeechTranslator from "./pages/SpeechTranslator";
// import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      {/* ✅ Place ScrollToTop OUTSIDE <Routes> */}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/book"
          element={
            <ProtectedRoute>
              {/* <Navbar /> */}
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route path="/speech"
          element={
            <ProtectedRoute>
              {/* <Navbar /> */}
              {/* <BookAppointment /> */}
              <SpeechTranslator />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
