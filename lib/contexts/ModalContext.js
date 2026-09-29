'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalConfig, setModalConfig] = useState(null);

  const showModal = useCallback((config) => {
    return new Promise((resolve) => {
      setModalConfig({
        ...config,
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setModalConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  const showAlert = useCallback((title, message, type = 'INFO') => {
    return showModal({ title, message, type, showCancel: false });
  }, [showModal]);

  const showConfirm = useCallback((title, message, type = 'DANGER') => {
    return showModal({ title, message, type, showCancel: true });
  }, [showModal]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, modalConfig }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
