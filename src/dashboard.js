import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { tempData, humData, weatherHours } from './data.js';

function Dashboard() {
  const tempChartRef = useRef(null);
  const humChartRef = useRef(null);
  const tempChartInstance = useRef(null);
  const humChartInstance = useRef(null);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    if (tempChartRef.current) {
      if (tempChartInstance.current) tempChartInstance.current.destroy();
      tempChartInstance.current = new Chart(tempChartRef.current, {
        type: "line",
        data: tempData,
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: false } },
        },
      });
    }
    if (humChartRef.current) {
      if (humChartInstance.current) humChartInstance.current.destroy();
      humChartInstance.current = new Chart(humChartRef.current, {
        type: "line",
        data: humData,
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: false } },
        },
      });
    }
    return () => {
      if (tempChartInstance.current) tempChartInstance.current.destroy();
      if (humChartInstance.current) humChartInstance.current.destroy();
    };
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

