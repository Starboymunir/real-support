"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  deleteChat,
  getChatIdFromAdmin,
  getChatIdFromBookingId,
  getChatIdFromParticipantId,
  getChatList,
  getChatWithMessage,
  getChatWithTitle,
  getUnreadChatCount,
  getUnreadCountByChatId,
  sendChatMessage,
  updateLastReadAt,
} from "@/lib/api-helper/chat.api";
import { useAuthContext } from "./auth-providers";
import { useSocket } from "@/providers/SocketProvider";

type AnyFunction = (...args: any[]) => any;

type ChatContextType = {
  loadingChatList: boolean;
  chatList: any[] | null;
  loadingChatMessage: boolean;
  activeChat: any | null;
  content: any | null;
  loadingSendChatMessage: boolean;
  selectedImageFile: any | null;
  loadingDeleteChat: boolean;
  isAdminPage: boolean;
  activeChatId: string | null | undefined;
  fileInputRef: React.RefObject<HTMLInputElement>;
  participantId: string | null | undefined;
  activeChatMessages: any[] | null;
  activeChatIsAdminChat: boolean;
  bookingId: string | null | undefined;
  adminChatUserId: string | null | undefined;
  selectedImageUrl: string | null;
  unreadChatCount: number;
  setUnreadChatCount: AnyFunction;
  setChatList: AnyFunction;
  activeChatIsArchived: boolean;
  loadingOpenChat: boolean;
  setActiveChat: AnyFunction;
  setContent: AnyFunction;
  setSelectedImageFile: AnyFunction;
  setLoadingDeleteChat: AnyFunction;
  resetState: AnyFunction;
  openChatFromOtherResources: AnyFunction;
  addMessageToActiveChat: AnyFunction;
  loadChatList: AnyFunction;
  loadChatDetails: AnyFunction;
  handleSendMessageButtonClick: AnyFunction;
  handleDeleteChatButtonClick: AnyFunction;
  handleContentInputChange: AnyFunction;
  handleContentInputKeyDown: AnyFunction;
  handleImageInputChange: AnyFunction;
  handleUploadClearImageButtonClick: AnyFunction;
  handleSocketEventNewMessageReceive: AnyFunction;
  handleSocketEventChatDeleted: AnyFunction;
  handleSocketEventNewChatCreated: AnyFunction;
};

// import { useMemo } from "react";
// import { useRouter } from "next/navigation";

export const useQueryParam = (key: string) => {
  const searchParams = useSearchParams();

  return useMemo(() => {
    return searchParams.get(key) || undefined;
  }, [searchParams, key]);
};
// Create a Context for the user
const ChatContext = createContext<ChatContextType>({
  loadingChatList: false,
  chatList: null,
  loadingChatMessage: false,
  activeChat: null,
  content: null,
  selectedImageFile: null,
  loadingDeleteChat: false,
  activeChatId: null,
  participantId: null,
  bookingId: null,
  adminChatUserId: null,
  loadingSendChatMessage: false,
  activeChatIsArchived: false,
  activeChatIsAdminChat: false,
  loadingOpenChat: false,
  isAdminPage: false,
  fileInputRef: null as any,
  activeChatMessages: null,
  selectedImageUrl: null,
  unreadChatCount: 0,
  setUnreadChatCount: () => {},
  setChatList: () => {},
  setActiveChat: () => {},
  setContent: () => {},
  setSelectedImageFile: () => {},
  setLoadingDeleteChat: () => {},
  resetState: () => {},
  openChatFromOtherResources: () => {},
  addMessageToActiveChat: () => {},
  loadChatList: () => {},
  loadChatDetails: () => {},
  handleSendMessageButtonClick: () => {},
  handleDeleteChatButtonClick: () => {},
  handleContentInputChange: () => {},
  handleContentInputKeyDown: () => {},
  handleImageInputChange: () => {},
  handleUploadClearImageButtonClick: () => {},
  handleSocketEventNewMessageReceive: () => {},
  handleSocketEventChatDeleted: () => {},
  handleSocketEventNewChatCreated: () => {},
});

// Create a custom hook to use the ChatContext
const useChatContext = () => {
  return useContext(ChatContext);
};

// Create a provider component
const ChatProvider = ({ children }: any) => {
  const router = useRouter();
  const pathName = usePathname();
  const { socket } = useSocket();

  const activeChatId = useQueryParam("chatId");
  const participantId = useQueryParam("participantId");
  const bookingId = useQueryParam("bookingId");
  const adminChatUserId = useQueryParam("adminChatUserId");

  // const searchParams = useSearchParams();
  // const participantId = searchParams.get("participantId");
  // const bookingId = searchParams.get("bookingId");

  const { userId } = useAuthContext();

  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [chatList, setChatList] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [content, setContent] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [loadingChatList, setLoadingChatList] = useState<boolean>(false);
  const [loadingChatMessage, setLoadingChatMessage] = useState<boolean>(false);
  const [loadingDeleteChat, setLoadingDeleteChat] = useState<boolean>(false);
  const [loadingOpenChat, setLoadingOpenChat] = useState<boolean>(false);
  const [loadingSendChatMessage, setLoadingSendChatMessage] =
    useState<boolean>(false);

  const fileInputRef = React.createRef<HTMLInputElement>();

  const isAdminPage = useMemo(() => {
    return pathName.includes("/admin/dashboard");
  }, [pathName]);

  const isChatPage = useMemo(() => {
    return pathName.includes("/chat");
  }, [pathName]);

  const chatPageUrl = useMemo(() => {
    if (isAdminPage) {
      return "/admin/dashboard/chat";
    }
    return "/chat";
  }, [isAdminPage]);

  const activeChatMessages = useMemo<any[] | null>(
    () => activeChat?.messages || [],
    [activeChat]
  );
  const activeChatIsAdminChat = useMemo<boolean>(
    () => !!activeChat?.isAdminChat,
    [activeChat]
  );

  const activeChatIsArchived = useMemo<boolean>(
    () => !!activeChat?.deletedAt,
    [activeChat]
  );

  const selectedImageUrl = useMemo(() => {
    if (selectedImageFile) {
      return URL.createObjectURL(selectedImageFile);
    }
    return null;
  }, [selectedImageFile]);

  function resetState() {
    setChatList([]);
    setActiveChat(null);
    setSelectedImageFile(null);
    setLoadingChatList(false);
    setLoadingChatMessage(false);
    setLoadingSendChatMessage(false);
  }
  function gotoChatList() {
    router.replace(chatPageUrl);
  }
  function openChat(chatId: string) {
    if (!chatId) return;

    router.replace(`${chatPageUrl}?chatId=${chatId}`);
  }

  async function openChatFromOtherResources({
    participantId = null,
    bookingId = null,
    chatId = null,
    adminChat = null,
    adminChatUserId = null,
  }: any) {
    if (chatId) {
      return openChat(chatId);
    }
    if (participantId) {
      const chatId = await getChatIdFromParticipantId(participantId);
      return openChat(chatId);
    }
    if (bookingId) {
      const chatId = await getChatIdFromBookingId(bookingId);
      return openChat(chatId);
    }
    if (adminChat) {
      const chatId = await getChatIdFromAdmin();
      return openChat(chatId);
    }
    if (adminChatUserId) {
      const chatId = await getChatIdFromAdmin(adminChatUserId);
      return openChat(chatId);
    }
    gotoChatList();
  }

  function addMessageToActiveChat(message: any) {
    if (activeChatId !== message.chatId) return;
    console.log("addMessageToActiveChat", message);
    setActiveChat((x: any) => ({
      ...x,
      messages: [...(x?.messages || []), message],
    }));
  }

  async function loadChatList() {
    if (!userId) return;

    setLoadingChatList(true);
    try {
      setChatList([]);
      const chatList = await getChatList(userId, isAdminPage);
      console.log("chatList---------222-----------", chatList);
      if (chatList) {
        setChatList(chatList);
      }
    } catch (e) {
    } finally {
      setLoadingChatList(false);
    }
  }

  async function loadChatDetails() {
    console.log("load details------", activeChatId, userId);
    
    if (!userId || !activeChatId) return;

    setLoadingChatMessage(true);
    try {
      setActiveChat(null);
      const chatWithDetails = await getChatWithMessage(activeChatId, userId);

      console.log('chatWithDetails---------', chatWithDetails);
      


      if (chatWithDetails) {
        setActiveChat(chatWithDetails);
        updateLastRead(activeChatId);
        // if (chatList.findIndex((x) => x.id === activeChatId) === -1) {
        //   loadChatList();
        // }
      }
    } catch (e) {
    } finally {
      setLoadingChatMessage(false);
    }
  }

  function deleteChatFromUi(chatId: string) {
    if (!chatId) return;

    setChatList((x) => [...x.filter((x) => x.id !== chatId)]);
    if (activeChatId === chatId) {
      gotoChatList();
      setActiveChat(null);
    }
  }

  function updateUnReadCountInStore(
    chatId: string,
    unreadCount: string | number
  ) {
    if (!chatId) return;

    setChatList((x: any) => [
      ...x.map((chat: any) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            unreadCount,
          };
        }
        return chat;
      }),
    ]);
    // loadUnreadChatCount();
  }

  async function updateLastReadCount(chatId: string) {
    if (!chatId) return;

    const count = await getUnreadCountByChatId(chatId);
    updateUnReadCountInStore(chatId, count);
  }
  async function updateLastRead(chatId: string) {
    if (!chatId) return;

    await updateLastReadAt(chatId);
    updateUnReadCountInStore(chatId, 0);
  }

  async function handleSendMessageButtonClick() {
    if (!activeChatId || !(content || selectedImageFile)) return;

    setLoadingSendChatMessage(true);
    try {
      await sendChatMessage(activeChatId, content, selectedImageFile);
      setContent("");
      setSelectedImageFile(null);
    } catch (e) {
    } finally {
      setLoadingSendChatMessage(false);
    }
  }

  async function handleDeleteChatButtonClick(chatId: string) {
    if (!chatId) return;

    setLoadingDeleteChat(true);
    try {
      const deletedChat = await deleteChat(chatId);
      if (deletedChat) {
        deleteChatFromUi(chatId);
      }
    } catch (e) {
    } finally {
      setLoadingDeleteChat(false);
    }
  }

  function handleContentInputChange(event: any) {
    setContent(event.target.value);
  }

  function handleContentInputKeyDown(event: any) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents page refresh
      handleSendMessageButtonClick();
    }
  }

  async function handleImageInputChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImageFile(file);
  }

  async function handleUploadClearImageButtonClick() {
    if (!!selectedImageUrl) {
      setSelectedImageFile(null);
    } else {
      fileInputRef.current?.click();
    }
  }

  async function handleSocketEventNewMessageReceive(message: any) {
    console.log("handleSocketEventNewMessageReceive", message, {
      activeChatId,
    });
    if (activeChatId === message.chatId) {
      addMessageToActiveChat(message);
      await updateLastRead(message.chatId);
      updateUnReadCountInStore(message.chatId, 0);
    } else {
      await updateLastReadCount(message.chatId);
    }
  }

  async function handleSocketEventChatDeleted(chat: any) {
    if (!chat) return;

    deleteChatFromUi(chat.id);
    // loadUnreadChatCount();
  }
  async function handleSocketEventNewChatCreated(chet: any) {
    if (!userId || !chet) return;

    const chetWithTitle = getChatWithTitle(chet, userId);

    setChatList((x: any) => {
      if (!x) {
        return [chetWithTitle];
      }
      return [...x, chetWithTitle];
    });

    // loadUnreadChatCount();
  }

  async function loadUnreadChatCount(ignoreChatPage = false) {
    if (!userId) return;
    if (ignoreChatPage && isChatPage) return;

    const count = await getUnreadChatCount();
    setUnreadChatCount(count);
  }

  function handleGlobalSocketEventNewMessageReceive() {
    console.log("handleGlobalSocketEventNewMessageReceive");
    loadUnreadChatCount(true);
  }

  useEffect(() => {
    handleGlobalSocketEventNewMessageReceive();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "MESSAGE_RECEIVED_EVENT",
      handleGlobalSocketEventNewMessageReceive
    );

    return () => {
      socket.off(
        "MESSAGE_RECEIVED_EVENT",
        handleGlobalSocketEventNewMessageReceive
      );
    };
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        loadingChatList,
        chatList,
        loadingChatMessage,
        activeChat,
        content,
        selectedImageFile,
        loadingDeleteChat,
        activeChatId,
        participantId,
        bookingId,
        adminChatUserId,
        loadingSendChatMessage,
        activeChatIsArchived,
        activeChatIsAdminChat,
        isAdminPage,
        fileInputRef,
        activeChatMessages,
        selectedImageUrl,
        loadingOpenChat,
        unreadChatCount,
        setUnreadChatCount,
        setChatList,
        setActiveChat,
        setContent,
        setSelectedImageFile,
        setLoadingDeleteChat,
        resetState,
        openChatFromOtherResources,
        addMessageToActiveChat,
        loadChatList,
        loadChatDetails,
        handleSendMessageButtonClick,
        handleDeleteChatButtonClick,
        handleContentInputChange,
        handleImageInputChange,
        handleUploadClearImageButtonClick,
        handleSocketEventNewMessageReceive,
        handleSocketEventChatDeleted,
        handleSocketEventNewChatCreated,
        handleContentInputKeyDown,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, useChatContext };
