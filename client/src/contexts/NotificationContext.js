import React, { createContext, useContext, useReducer } from 'react';
import { createPortal } from 'react-dom';
import Notification from '../components/Notification';

export const NotificationContext = createContext();

const initialState = {
  message: '',
  open: false,
};

export const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return {
        id: new Date().getTime() + Math.random(),
        message: action.data.message,
        severity: action.data.severity,
        open: true,
        timer: action.data.timer || 2000,
      };
    case 'REMOVE':
      return initialState;
    default:
      return state;
  }
};

export const NotificationProvider = (props) => {
  const [notification, dispatchNotification] = useReducer(
    notificationReducer,
    initialState
  );

  return (
    <NotificationContext.Provider
      value={{ notification, dispatchNotification }}
    >
      {props.children}
      {createPortal(
        <Notification notification={notification} />,
        document.body
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
