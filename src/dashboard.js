import React, { useEffect, useRef, useState } from "react";

const tempData = {
  labels: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
  datasets: [
    {
      label: "Temperatura (°C)",
      data: [21, 21.5, 22, 22.2, 22.1, 22],
      borderColor: "rgba(255,99,132,1)",
      backgroundColor: "rgba(255,99,132,0.1)",
      fill: true,
      tension: 0.3,
    },
  ],
};
const humData = {
  labels: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
  datasets: [
    {
      label: "Umidità (%)",
      data: [44, 45, 45, 46, 45, 45],
      borderColor: "rgba(54,162,235,1)",
      backgroundColor: "rgba(54,162,235,0.1)",
      fill: true,
      tension: 0.3,
    },
  ],
};
const weatherHours = [
  { ora: "00", temp: 18, icon: "🌙" },
  { ora: "01", temp: 18, icon: "🌙" },
  { ora: "02", temp: 17, icon: "🌙" },
  { ora: "03", temp: 17, icon: "🌙" },
  { ora: "04", temp: 16, icon: "🌙" },
  { ora: "05", temp: 16, icon: "🌙" },
  { ora: "06", temp: 17, icon: "🌤️" },
  { ora: "07", temp: 18, icon: "🌤️" },
  { ora: "08", temp: 20, icon: "☀️" },
  { ora: "09", temp: 22, icon: "☀️" },
  { ora: "10", temp: 24, icon: "☀️" },
  { ora: "11", temp: 25, icon: "☀️" },
  { ora: "12", temp: 26, icon: "☀️" },
  { ora: "13", temp: 27, icon: "☀️" },
  { ora: "14", temp: 28, icon: "☀️" },
  { ora: "15", temp: 28, icon: "☀️" },
  { ora: "16", temp: 27, icon: "☀️" },
  { ora: "17", temp: 26, icon: "☀️" },
  { ora: "18", temp: 25, icon: "☀️" },
  { ora: "19", temp: 24, icon: "☀️" },
  { ora: "20", temp: 23, icon: "🌤️" },
  { ora: "21", temp: 22, icon: "🌤️" },
  { ora: "22", temp: 21, icon: "🌙" },
  { ora: "23", temp: 20, icon: "🌙" },
];

function Dashboard() {
  const tempChartRef = useRef(null);
  const humChartRef = useRef(null);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    if (window.Chart) {
      if (tempChartRef.current) {
        new window.Chart(tempChartRef.current, {
          type: "line",
          data: tempData,
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } },
          },
        });
      }
      if (humChartRef.current) {
        new window.Chart(humChartRef.current, {
          type: "line",
          data: humData,
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } },
          },
        });
      }
    }
  }, []);

  useEffect(() => {
    function updateDateTime() {
      const now = new Date();
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      const dateStr = now.toLocaleDateString("it-IT", options);
      const timeStr = now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
      setDateTime(`${dateStr} - ${timeStr}`);
    }
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="left-panel">
        <div className="title">Casa</div>
        <div className="value" id="temperature">22°C</div>
        <div className="label">Temperatura</div>
        <canvas ref={tempChartRef} width={180} height={90} style={{ marginBottom: 20 }} />
        <div className="value" id="humidity">45%</div>
        <div className="label">Umidità</div>
        <canvas ref={humChartRef} width={180} height={90} />
      </div>
      <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%' }}>
        <div style={{ width: '100%', height: "50%" }}>
          <div className="title" style={{ marginTop: 40 }}>Meteo</div>
          <div style={{ fontSize: '1.1em', color: '#444', marginBottom: 18 }}>{dateTime}</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className="value">Soleggiato</div>
            <div className="label">25°C</div>
            <div id="weatherBoxes">
              {weatherHours.map((w) => (
                <div key={w.ora} className="weather-hour-box">
                  <div className="weather-hour-time">{w.ora}:00</div>
                  <div className="weather-hour-emoji">{w.icon}</div>
                  <div className="weather-hour-temp">{w.temp}°</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: "50%", marginTop: 30, textAlign: 'right', fontSize: '1.3em', color: '#333', fontStyle: 'italic' }}>
          "Questa è una frase personalizzata in basso a destra."
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

