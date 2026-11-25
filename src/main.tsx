import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'
import { ThemeProvider } from './lib/theme'
import { LangProvider } from './lib/lang'
import { ToastProvider } from './lib/toast'
import { AuthProvider } from './lib/auth'
import { CatalogProvider } from './lib/catalog'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LangProvider>
        <ToastProvider>
          <AuthProvider>
            <CatalogProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </CatalogProvider>
          </AuthProvider>
        </ToastProvider>
      </LangProvider>
    </ThemeProvider>
  </StrictMode>,
)
