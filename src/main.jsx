import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
