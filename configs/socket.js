import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
export const SOCKET_URL = 'http://192.168.1.103:3001';
// const socket = io(SOCKET_URL);

// export const connectToServer = () => {
//   socket.connect();
// };

// export const disconnectToServer = () => {
//   socket.disconnect();
// };

// export const emitEventToServer = (eventName, data) => {
//   socket.emit(eventName, data);
// };

export const socket = io(SOCKET_URL);
