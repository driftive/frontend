import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router';
import {AppRoutes} from "./routes.tsx";
import {AuthProvider} from "./context/auth/provider.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
