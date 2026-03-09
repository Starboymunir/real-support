"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io as ClientIo, Socket } from "socket.io-client";
import { fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { Amplify } from "aws-amplify";
import awsconfig from "@/amplifyconfiguration.json";

Amplify.configure(awsconfig);

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const hubListenerRef = useRef<() => void>();

  const connect = useCallback(async () => {
    try {
      setError(null);

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      const newSocket = ClientIo(process.env.NEXT_PUBLIC_BACKEND_API, {
        withCredentials: true,
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ["websocket"], // Force WebSocket transport
        upgrade: false, // Disable protocol upgrade
        secure: true, // Use secure connection
        rejectUnauthorized: false, // Only for development with self-signed certs
      });

      const onConnect = () => {
        setIsConnected(true);
        setError(null);
        console.log("Socket connected-----------");
      };
      
      const onDisconnect = (reason: string) => {
        setIsConnected(false);
        console.log("Socket disconnected:", reason);
      };
      
      const onConnectError = (err: Error) => {
        setError(err.message);
        console.error("Socket connection error:", err);
      };
      
      const onReconnectAttempt = (attempt: number) => {
        console.log(`Reconnection attempt ${attempt}`);
      };
      
      const onReconnectFailed = () => {
        setError("Failed to reconnect socket");
        console.error("Socket reconnection failed");
      };
      
      newSocket.on("connect", onConnect);
      newSocket.on("disconnect", onDisconnect);
      newSocket.on("connect_error", onConnectError);
      newSocket.on("reconnect_attempt", onReconnectAttempt);
      newSocket.on("reconnect_failed", onReconnectFailed);
      
      newSocket.connect();
      
      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect socket");
      console.error("Socket connection error:", err);
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setError(null);
    }
  }, []);

  useEffect(() => {
    const handleAuthEvents = ({
      payload: { event },
    }: {
      payload: { event: string };
    }) => {
      console.log("Auth event:", event);
      switch (event) {
        case "signIn":
          connect();
          break;
        case "signOut":
          disconnect();
          break;
      }
    };

    // Store the listener removal function in the ref
    hubListenerRef.current = Hub.listen("auth", handleAuthEvents);

    fetchAuthSession()
      .then(() => connect())
      .catch(() => console.log("User not authenticated"));

    return () => {
      // Call the listener removal function if it exists
      if (hubListenerRef.current) {
        hubListenerRef.current();
      }
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, error, connect, disconnect }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
