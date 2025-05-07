import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; // **Import BrowserRouter**

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* **Wrap App with BrowserRouter** */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

<<<<<<< HEAD
reportWebVitals();
=======
reportWebVitals();
>>>>>>> e661013dcd82d5a92ebf9170e35700ede9dfc757
