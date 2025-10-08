import React, { useEffect, useState } from "react";

const DoctorAppointments = () => {
  const DOCTOR_ID = localStorage.getItem("doctorId") || "68dcdc4b7eebe60e7a655d46";
  const API_BASE = "https://clinic-world.onrender.com";

  const [ongoing, setOngoing] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchAppointments = async () => {
    try {
      const resp = await fetch(`${API_BASE}/doctors/get-todays-appointments/${DOCTOR_ID}`);
      const json = await resp.json();

      if (!json.success || !Array.isArray(json.appointments)) {
        setOngoing(null);
        setUpcoming([]);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        return;
      }

      const sorted = json.appointments.sort((a, b) => a.appointmentNumber - b.appointmentNumber);
      const inProcess = sorted.filter((a) => a.patientStatus === "inProcess");

      const ongoingApp = inProcess.length ? inProcess[0] : null;
      const upcomingApps = inProcess.length > 1 ? inProcess.slice(1, 6) : [];

      setOngoing(ongoingApp);
      setUpcoming(upcomingApps);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("fetchAppointments error", err);
      setOngoing(null);
      setUpcoming([]);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center p-5 w-full max-w-xl bg-transparent">
      <div className="relative flex flex-col gap-4 w-full">
        {/* Badge */}
        {ongoing && (
          <div className="absolute right-[6px] -top-[18px] bg-gradient-to-b from-[#eef6ff] to-[#dff1ff] border border-blue-100 p-3 rounded-xl shadow-md flex items-center gap-3 min-w-[140px] justify-center">
            <div>
              <div className="text-[34px] font-extrabold text-[#005399] leading-none">
                #{ongoing.appointmentNumber}
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium text-center">
              Current<br />Number
            </div>
          </div>
        )}

        {/* Section */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[#005399] font-bold text-lg">Today's queue</div>
            <div className="text-sm text-[#667085]">{lastUpdated || "—"}</div>
          </div>

          {/* Ongoing */}
          <div className="mt-3">
            <div className="text-[#0b7285] font-bold mb-2">Ongoing</div>
            {ongoing ? (
              <div className="flex justify-between items-start gap-3 p-3 border border-[#eef6ff] bg-[#fafcff] rounded-lg shadow-sm min-h-[84px]">
                <div className="flex gap-3 items-center">
                  <div className="w-[54px] h-[54px] rounded-lg flex items-center justify-center bg-gradient-to-b from-[#eaf6ff] to-[#dff4ff] text-[#005399] font-extrabold text-lg shadow-sm">
                    #{ongoing.appointmentNumber}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[18px] font-bold text-[#0f1724]">
                      {ongoing.patientName || "—"}
                    </div>
                    <div className="text-sm text-[#667085]">
                      Age: {ongoing.patientAge || "—"} · {ongoing.patientProblem || "No problem listed"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`status text-xs font-bold capitalize px-3 py-1 rounded-full border
                    ${
                      ongoing.patientStatus === "completed"
                        ? "bg-[#e9f7ec] text-green-600 border-green-100"
                        : ongoing.patientStatus === "notCheck"
                        ? "bg-[#fff0f2] text-red-600 border-red-100"
                        : "bg-[#e6f4f4] text-[#0b7285] border-cyan-100"
                    }`}
                  >
                    {ongoing.patientStatus}
                  </div>
                  <div className="text-xs text-[#667085]">Arrived</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#667085]">No ongoing patients</div>
            )}
          </div>

          {/* Upcoming */}
          <div className="mt-4 text-[#0b7285] font-bold">Upcoming (next 5)</div>
          <div className="flex flex-col gap-2 mt-2">
            {upcoming.length === 0 ? (
              <div className="text-sm text-[#667085]">No upcoming patients</div>
            ) : (
              upcoming.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white border border-[#f0f3f7] rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[44px] h-[44px] rounded-md flex items-center justify-center bg-gradient-to-b from-[#eaf6ff] to-[#dff4ff] text-[#005399] font-bold text-sm shadow-sm">
                      #{a.appointmentNumber}
                    </div>
                    <div>
                      <div className="font-bold text-[15px]">{a.patientName}</div>
                      <div className="text-[13px] text-[#667085]">
                        Age {a.patientAge} · {a.patientProblem || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize border
                    ${
                      a.patientStatus === "completed"
                        ? "bg-[#e9f7ec] text-green-600 border-green-100"
                        : a.patientStatus === "notCheck"
                        ? "bg-[#fff0f2] text-red-600 border-red-100"
                        : "bg-[#e6f4f4] text-[#0b7285] border-cyan-100"
                    }`}
                  >
                    {a.patientStatus}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
