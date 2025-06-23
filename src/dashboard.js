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
  const [message, setMessage] = useState();
  const messageRef = useRef(message);

  const startedRef = useRef(false);

  // Aggiorna messageRef.current ogni volta che message cambia
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Funzione per leggere l'offset da localStorage
  function getTelegramOffset() {
    const stored = localStorage.getItem('telegram_last_update_id');
    return stored ? parseInt(stored, 10) + 1 : undefined;
  }

  // Funzione per aggiornare l'offset in localStorage
  function setTelegramOffset(newId) {
    localStorage.setItem('telegram_last_update_id', newId);
  }

  // Funzione per processare gli update e aggiornare localStorage
  function processTelegramUpdates(updatesData) {
    console.log('Telegram updates:', updatesData.result);
    if (updatesData.result && updatesData.result.length > 0) {
      const last = updatesData.result[updatesData.result.length - 1];
      setTelegramOffset(last.update_id);
      const lastMsg = (last.message && last.message.text) ? last.message.text : 'No message ...';
      localStorage.setItem('telegram_last_message', lastMsg);
      return lastMsg;
    }
    return null;
  }

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

    // All'avvio, recupera l'ultimo messaggio già presente se non ci sono nuovi update
    const offset = getTelegramOffset();
    handleTelegramUpdate(config.botToken, offset).then(updatesData => {
      let newMessage = null;
      if (updatesData.result && updatesData.result.length > 0) {
        // Se ci sono nuovi update, processa normalmente
        newMessage = processTelegramUpdates(updatesData);
      } else {
        // Se non ci sono nuovi update, mostra l'ultimo messaggio salvato
        const lastMsg = localStorage.getItem('telegram_last_message') || 'No message ...';
        setMessage(lastMsg);
      }
      if (newMessage && newMessage !== messageRef.current) {
        setMessage(newMessage);
      }
    });

    let botInterval = setInterval(_ => {
      const offset = getTelegramOffset();
      handleTelegramUpdate(config.botToken, message !== undefined ? offset : 0).then(updatesData => {
        const newMessage = processTelegramUpdates(updatesData);
        if (newMessage && newMessage !== messageRef.current) {
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
  
  // Aggiorna manualmente il messaggio e offset quando premi il bottone
  function updateMessageManual() {
    const offset = getTelegramOffset();
    handleTelegramUpdate(config.botToken, offset).then(updatesData => {
      const newMessage = processTelegramUpdates(updatesData);
      if (newMessage && newMessage !== messageRef.current) {
        setMessage(newMessage);
        localStorage.setItem('telegram_last_message', newMessage);
      }
    });
  }

  // Calcola la dimensione ottimale del font per il messaggio
  function getMessageFontSize(msg) {
    if (!msg) return '1.3em';
    if (msg.length < 30) return '2.2em';
    if (msg.length < 60) return '1.7em';
    if (msg.length < 100) return '1.2em';
    return '1em';
  }

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
        <div style={{ width: '100%', maxHeight:'50%', minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div id="weatherBoxes">

            {weatherHours.filter(w => w.ora >= new Date().getHours()).map((w) => (
              <div key={w.ora} className="weather-hour-box">
                <div className="weather-hour-time">{w.ora}:00</div>
                <div className="weather-hour-emoji">{w.icon}</div>
                <div className="weather-hour-temp">{w.temp}°</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: '50%', marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', textAlign: 'right', fontSize: getMessageFontSize(message), color: '#333', fontStyle: 'italic', wordBreak: 'break-word', lineHeight: 1.1, overflowWrap: 'break-word', whiteSpace: 'pre-line', maxHeight: '100%', overflowY: 'auto' }}>
          <button onClick={updateMessageManual} style={{ marginRight: 10, fontSize: '1em' }}>Aggiorna Messaggio</button>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

