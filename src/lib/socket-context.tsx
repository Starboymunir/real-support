'use client';

/* ═══════════════════════════════════════════════════════════
   Socket.IO Context — real-time communication layer
   ═══════════════════════════════════════════════════════════ */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { getToken } from './api';
import { useAuth } from './auth-context';

// ── Socket event constants (mirrors backend SOCKET_EVENT_ENUM) ──

export const SOCKET_EVENTS = {
  // Chat
  NEW_CHAT_EVENT: 'NEW_CHAT_EVENT',
  MESSAGE_RECEIVED_EVENT: 'MESSAGE_RECEIVED_EVENT',
  CHAT_DELETE_EVENT: 'CHAT_DELETE_EVENT',
  // Booking
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_ACCEPTED: 'BOOKING_ACCEPTED',
  BOOKING_UPDATED: 'BOOKING_UPDATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  // Wallet
  WALLET_TRANSACTION: 'WALLET_TRANSACTION',
  // Request
  NEW_REQUEST: 'NEW_REQUEST',
  REQUEST_UPDATED: 'REQUEST_UPDATED',
  REQUEST_CANCELLED: 'REQUEST_CANCELLED',
  // Withdrawal
  WITHDRAWAL_REQUESTED: 'WITHDRAWAL_REQUESTED',
  WITHDRAWAL_PROCESSED: 'WITHDRAWAL_PROCESSED',
  // Driver
  DRIVER_PROFILE_UPDATED: 'DRIVER_PROFILE_UPDATED',
  // Bid
  BID_CREATED: 'BID_CREATED',
  BID_UPDATED: 'BID_UPDATED',
  BID_CANCELED: 'BID_CANCELED',
  // Dispatch
  DISPATCH_OFFERED_TO_DRIVER: 'DISPATCH_OFFERED_TO_DRIVER',
  DISPATCH_OFFER_EXPIRED: 'DISPATCH_OFFER_EXPIRED',
  DISPATCH_OFFER_REJECTED: 'DISPATCH_OFFER_REJECTED',
  DISPATCH_OFFER_ACCEPTED: 'DISPATCH_OFFER_ACCEPTED',
  DISPATCH_POSTED_TO_BOARD: 'DISPATCH_POSTED_TO_BOARD',
  DISPATCH_SEARCHING_STATUS: 'DISPATCH_SEARCHING_STATUS',
  // Support Tickets
  NEW_SUPPORT_TICKET: 'NEW_SUPPORT_TICKET',
  SUPPORT_TICKET_UPDATED: 'SUPPORT_TICKET_UPDATED',
  SUPPORT_TICKET_MESSAGE: 'SUPPORT_TICKET_MESSAGE',
  // Broadcast
  BROADCAST_MESSAGE: 'BROADCAST_MESSAGE',
  // Contact Us
  NEW_CONTACT_US: 'NEW_CONTACT_US',
  CONTACT_US_UPDATED: 'CONTACT_US_UPDATED',
} as const;

// ── Context types ──

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  unreadNotifications: number;
  unreadChats: number;
  setUnreadNotifications: (n: number | ((prev: number) => number)) => void;
  setUnreadChats: (n: number | ((prev: number) => number)) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  unreadNotifications: 0,
  unreadChats: 0,
  setUnreadNotifications: () => {},
  setUnreadChats: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

// ── Provider ──

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_API
  ? process.env.NEXT_PUBLIC_BACKEND_API.replace('/api', '')
  : 'https://backend.real-support.com'

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, admin } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const currentUser = user || admin;

  useEffect(() => {
    const token = getToken();
    if (!currentUser || !token) {
      // Disconnect existing socket if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Already connected for this user
    if (socketRef.current?.connected) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Increment unread counts on real-time events (skip own messages)
    newSocket.on(SOCKET_EVENTS.MESSAGE_RECEIVED_EVENT, (data: any) => {
      if (data?.senderId !== currentUser?.id) {
        setUnreadChats((prev) => prev + 1);
      }
    });

    newSocket.on(SOCKET_EVENTS.NEW_CHAT_EVENT, () => {
      setUnreadChats((prev) => prev + 1);
    });

    // Notifications via booking, wallet, request events - increment notification count
    const notifEvents = [
      SOCKET_EVENTS.BOOKING_CREATED,
      SOCKET_EVENTS.BOOKING_ACCEPTED,
      SOCKET_EVENTS.BOOKING_UPDATED,
      SOCKET_EVENTS.BOOKING_CANCELLED,
      SOCKET_EVENTS.BOOKING_COMPLETED,
      SOCKET_EVENTS.WALLET_TRANSACTION,
      SOCKET_EVENTS.NEW_REQUEST,
      SOCKET_EVENTS.REQUEST_UPDATED,
      SOCKET_EVENTS.REQUEST_CANCELLED,
      SOCKET_EVENTS.WITHDRAWAL_REQUESTED,
      SOCKET_EVENTS.WITHDRAWAL_PROCESSED,
      SOCKET_EVENTS.BID_CREATED,
      SOCKET_EVENTS.BID_UPDATED,
      SOCKET_EVENTS.BID_CANCELED,
      SOCKET_EVENTS.DRIVER_PROFILE_UPDATED,
      SOCKET_EVENTS.NEW_SUPPORT_TICKET,
      SOCKET_EVENTS.SUPPORT_TICKET_UPDATED,
      SOCKET_EVENTS.SUPPORT_TICKET_MESSAGE,
      SOCKET_EVENTS.BROADCAST_MESSAGE,
    ];

    notifEvents.forEach((event) => {
      newSocket.on(event, () => {
        setUnreadNotifications((prev) => prev + 1);
      });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        unreadNotifications,
        unreadChats,
        setUnreadNotifications,
        setUnreadChats,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
