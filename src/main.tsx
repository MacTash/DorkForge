import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components.css'
import App from './AppSimplified.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
