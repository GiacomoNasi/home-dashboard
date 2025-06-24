// Minimal Express server to serve the React build in production
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback: serve index.html for any unknown route (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
