import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import socketIO from "socket.io-client";
import { SOCKET_URL } from "../apis/endpoint";
import { useAuth } from "./AuthContext";

const SocketContext = createContext({
  socket: null,
  connected: false,
});

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.userId;
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const nextSocket = socketIO(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      query: { userId },
    });

    setSocket(nextSocket);

    const joinUserRooms = () => {
      setConnected(true);
      nextSocket.emit("join", userId);
      nextSocket.emit("joinUser", userId);
      nextSocket.emit("registerUser", userId);
    };

    const handleDisconnect = () => setConnected(false);

    nextSocket.on("connect", joinUserRooms);
    nextSocket.on("disconnect", handleDisconnect);

    return () => {
      nextSocket.off("connect", joinUserRooms);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export const useSocketEvents = (events, handler) => {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);
  const eventKey = Array.isArray(events) ? events.join("|") : events;

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return undefined;

    const eventNames = eventKey.split("|");
    const listener = (...args) => handlerRef.current?.(...args);

    eventNames.forEach((eventName) => {
      socket.on(eventName, listener);
    });

    return () => {
      eventNames.forEach((eventName) => {
        socket.off(eventName, listener);
      });
    };
  }, [socket, eventKey]);
};
