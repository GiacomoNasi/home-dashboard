import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { tempData, humData, weatherHours, getWeatherHours, handleTelegramUpdate } from './data.js';
import config from './config.json';


function Dashboard() {
  const tempChartRef = useRef(null);
  const humChartRef = useRef(null);
  const tempChartInstance = useRef(null);
  const humChartInstance = useRef(null);
  const [dateTime, setDateTime] = useState("");
  const [weatherHours, setWeatherHours] = useState([])
  const [intervalStarted, setIntervalStartred] = useState(false) 
  const [message, setMessage] = useState("No message ...");
  const messageRef = useRef(message);

  const startedRef = useRef(false);

  // Aggiorna messageRef.current ogni volta che message cambia
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    // Cleanup intervalli globali se già esistenti (hot reload/StrictMode)
    if (window.__dashboardMeteoInterval) {
      clearInterval(window.__dashboardMeteoInterval);
      window.__dashboardMeteoInterval = null;
    }
    if (window.__dashboardBotInterval) {
      clearInterval(window.__dashboardBotInterval);
      window.__dashboardBotInterval = null;
    }

    let meteoInterval = null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          meteoInterval = setInterval(() => {
            getWeatherHours(pos.coords.latitude, pos.coords.longitude).then(data => setWeatherHours(data));
          }, 5000);
          window.__dashboardMeteoInterval = meteoInterval;
        },
        (err) => console.warn('Geoloc non disponibile, uso default'),
        { enableHighAccuracy: true, timeout: 60000 }
      );
    }

    let botInterval = setInterval(_ => {
      handleTelegramUpdate(config.botToken).then(update => {
        let newMessage = (update.result || [{message: {text: 'Could not retrieve messages'}}]).slice(-1)[0].message.text;
        if (newMessage !== messageRef.current) {
          setMessage(newMessage);
        }
      })
    }, 5000);
    window.__dashboardBotInterval = botInterval;

    return () => {
      if (window.__dashboardMeteoInterval) {
        clearInterval(window.__dashboardMeteoInterval);
        window.__dashboardMeteoInterval = null;
      }
      if (window.__dashboardBotInterval) {
        clearInterval(window.__dashboardBotInterval);
        window.__dashboardBotInterval = null;
      }
    };
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
    handleTelegramUpdate(config.botToken)


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
            <div className="value">{weatherHours[new Date().getHours()]?.temp || 'Unknown'}°C {weatherHours[new Date().getHours()]?.desc || 'Unknown'}</div>
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
          <button onClick={_ => updateMessage(setMessage)} style={{ marginRight: 10, fontSize: '1em' }}>Aggiorna Messaggio</button>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

