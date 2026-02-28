window.global = window;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './store/reducers/store.js';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';  // custom của bạn

// Import SnackbarProvider
import { SnackbarProvider } from 'notistack';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <ThemeProvider>  {/* Custom ThemeProvider của bạn */}
        {/* Đặt SnackbarProvider BÊN TRONG ThemeProvider */}
        <SnackbarProvider
          maxSnack={1}                    // max toast cùng lúc
          preventDuplicate                // tránh duplicate
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}  // vị trí
          autoHideDuration={null}         // Optional: nếu muốn persistent mặc định, nhưng bạn sẽ override per toast
        >
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </StrictMode>
  </Provider>
);