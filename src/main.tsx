import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {ConfigProvider} from 'antd'
import './index.css'
import {BrowserRouter} from 'react-router';
import {AppRoutes} from "./routes.tsx";
import {AuthProvider} from "./context/auth/provider.tsx";
import {QueryClientProvider} from "react-query";
import {queryClient} from "./api.ts";
import {theme} from "./theme/theme.ts";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes/>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
)
