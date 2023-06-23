import React, { createContext, useEffect, useState } from "react";
import { SOCKET_URL } from "../configs/socket";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(io.connect(SOCKET_URL));
  }, []);

  return (
    // the Provider gives access to the context to its children
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketContextProvider;

// "undefined" means the URL will be computed from the `window.location` object
const SOCKET_URL = 'http://192.168.1.103:3001';

export const socket = io(SOCKET_URL);
