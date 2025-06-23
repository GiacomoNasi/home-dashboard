import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { tempData, humData, weatherHours, getWeatherHours, handleTelegramUpdate, addTelegramReaction } from './data.js';
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
    if (updatesData.result && updatesData.result.length > 0) {
      // Filtra solo messaggi da utenti (non bot)
      const userMessages = updatesData.result.filter(
        upd => upd.message && upd.message.from && !upd.message.from.is_bot
      );
      if (userMessages.length > 0) {
        const last = userMessages[userMessages.length - 1];
        setTelegramOffset(last.update_id);
        localStorage.setItem('telegram_last_message', last.message.text || 'No message ...');
        return last.message;
      }
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
          getWeatherHours(pos.coords.latitude, pos.coords.longitude).then(data => setWeatherHours(data));
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
      let newMsgObj = null;
      if (updatesData.result && updatesData.result.length > 0) {
        newMsgObj = processTelegramUpdates(updatesData);
      } else {
        const lastMsg = localStorage.getItem('telegram_last_message') || 'No message ...';
        setMessage(lastMsg);
      }
      if (newMsgObj && newMsgObj.text && newMsgObj.text !== messageRef.current) {
        setMessage(newMsgObj.text);
        // Manda la reaction dopo aver aggiornato il messaggio
        addTelegramReaction(
          config.botToken,
          newMsgObj.chat.id,
          newMsgObj.message_id,
          '\u2705'
        );
      }
    });

    let botInterval = setInterval(_ => {
      const offset = getTelegramOffset();
      handleTelegramUpdate(config.botToken, message !== undefined ? offset : 0).then(updatesData => {
        const newMsgObj = processTelegramUpdates(updatesData);
        if (newMsgObj && newMsgObj.text && newMsgObj.text !== messageRef.current) {
          setMessage(newMsgObj.text);
          addTelegramReaction(
            config.botToken,
            newMsgObj.chat.id,
            newMsgObj.message_id,
            '\u2764' // codice UTF-16 per ✅
          );
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
      const newMsgObj = processTelegramUpdates(updatesData);
      if (newMsgObj && newMsgObj.text && newMsgObj.text !== messageRef.current) {
        setMessage(newMsgObj.text);
        localStorage.setItem('telegram_last_message', newMsgObj.text);
        addTelegramReaction(
          config.botToken,
          newMsgObj.chat.id,
          newMsgObj.message_id,
          '\u2705' // codice UTF-16 per ✅
        );
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
        <div style={{ width: '100%', height: '50%', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative' }}>
          <button
            onClick={updateMessageManual}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              zIndex: 2
            }}
            title="Aggiorna Messaggio"
            aria-label="Aggiorna Messaggio"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <div style={{ width: '100%', textAlign: 'left', fontSize: getMessageFontSize(message), color: '#333', fontStyle: 'bold', wordBreak: 'break-word', lineHeight: 1.1, overflowWrap: 'break-word', whiteSpace: 'pre-line', maxHeight: '100%', overflowY: 'auto', paddingRight: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

