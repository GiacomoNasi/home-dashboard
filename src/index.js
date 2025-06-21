import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './dashboard.js';
import './dashboard-react.css';

const root = createRoot(document.getElementById('root'));
root.render(<Dashboard />);

