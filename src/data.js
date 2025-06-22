export const tempData = {
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

export const humData = {
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

export const weatherHours = [
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

export async function getWeatherHours(lat, long) {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + long + "&hourly=temperature_2m,weathercode&timezone=Europe%2FRome";
  const response = await fetch(url);
  const data = await response.json();
  // data.hourly.time, data.hourly.temperature_2m, data.hourly.weathercode

  // Mappa weathercode a emoji/meteo e descrizione
  const codeToIcon = {
    0: { icon: "☀️", desc: "Sereno" },    // Clear sky
    1: { icon: "🌤️", desc: "Preval. sereno" },    // Mainly clear
    2: { icon: "⛅", desc: "Parz. nuvoloso" },     // Partly cloudy
    3: { icon: "☁️", desc: "Coperto" },    // Overcast
    45: { icon: "🌫️", desc: "Nebbia" },   // Fog
    48: { icon: "🌫️", desc: "Nebbia" },
    51: { icon: "🌦️", desc: "Pioviggine" },   // Drizzle
    53: { icon: "🌦️", desc: "Pioviggine" },
    55: { icon: "🌦️", desc: "Pioviggine" },
    61: { icon: "🌧️", desc: "Pioggia" },   // Rain
    63: { icon: "🌧️", desc: "Pioggia" },
    65: { icon: "🌧️", desc: "Pioggia" },
    71: { icon: "🌨️", desc: "Neve" },   // Snow
    73: { icon: "🌨️", desc: "Neve" },
    75: { icon: "🌨️", desc: "Neve" },
    80: { icon: "🌦️", desc: "Rovesci" },   // Rain showers
    81: { icon: "🌦️", desc: "Rovesci" },
    82: { icon: "🌦️", desc: "Rovesci" },
    95: { icon: "⛈️", desc: "Temporale" },   // Thunderstorm
    96: { icon: "⛈️", desc: "Temporale" },
    99: { icon: "⛈️", desc: "Temporale" }
  };

  // Prendi solo le prossime 24 ore
  const hours = data.hourly.time.slice(0, 24).map((t, i) => {
    const code = codeToIcon[data.hourly.weathercode[i]] || { icon: "❓", desc: "Sconosciuto" };
    return {
      ora: t.split('T')[1].slice(0, 2),
      temp: Math.round(data.hourly.temperature_2m[i]),
      icon: code.icon,
      desc: code.desc
    };
  });

  return hours;
}

export async function handleTelegramUpdate(botToken) {
  // Leggi l'ultimo messaggio del bot nella chat
  const getUpdatesUrl = `https://api.telegram.org/bot${botToken}/getUpdates`;
  const updatesResponse = await fetch(getUpdatesUrl);
  const updatesData = await updatesResponse.json();

  // Trova l'ultimo messaggio inviato dal bot nella stessa chat
  return updatesData

}