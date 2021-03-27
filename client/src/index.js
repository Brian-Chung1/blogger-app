import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';

ReactDOM.render(
  <BrowserRouter>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </BrowserRouter>,
  document.getElementById('root')
);
