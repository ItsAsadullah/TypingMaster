import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* basename যোগ করা হলো যাতে গিটহাব পেজে সঠিক পাথ পায় */}
    <BrowserRouter basename="/TypingMaster">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
