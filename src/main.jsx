import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// BrowserRouter এর বদলে HashRouter ইম্পোর্ট করা হলো
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* GitHub Pages এর জন্য HashRouter সবচেয়ে নিরাপদ */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)

