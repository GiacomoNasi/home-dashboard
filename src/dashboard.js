import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { tempData, humData, weatherHours, getWeatherHours } from './data.js';

function Dashboard() {
  const tempChartRef = useRef(null);
  const humChartRef = useRef(null);
  const tempChartInstance = useRef(null);
  const humChartInstance = useRef(null);
  const [dateTime, setDateTime] = useState("");
  const [weatherHours, setWeatherHours] = useState([])
  const [coords, setCoords] = useState({ latitude: 41.89, longitude: 12.48 }); // default Roma

  useEffect(() => {
    let interval = null
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {interval = setInterval(() => {
          getWeatherHours(pos.coords.latitude, pos.coords.longitude).then(data => setWeatherHours(data));
        }, 5000)},
        (err) => console.warn('Geoloc non disponibile, uso default'),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    return () => clearInterval(interval);

  }, []);

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
        <canvas ref={tempChartRef} width="100%" height="30%" style={{ marginBottom: 20 }} />
        <div className="value" id="humidity">45%</div>
        <div className="label">Umidità</div>
        <canvas ref={humChartRef}width="100%" height="30%" />
      </div>
      <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', height: '100%' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="value">25°C Soleggiato</div>
            <div className="label">{dateTime}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          </div>
        </div>
        <div style={{ width: '100%', maxHeight:'50%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
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
        <div style={{ width: '100%', height: '50%', marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', textAlign: 'right', fontSize: '1.3em', color: '#333', fontStyle: 'italic' }}>
            "Questa è una frase personalizzata in basso a destra."
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

