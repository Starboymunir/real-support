"use client";

import React, { useEffect, useMemo } from "react";
import { useChatContext } from "@/providers/ChatDataProvider";
import { useSocket } from "@/providers/SocketProvider";
import moment from "moment/moment";
import { getUrl } from "aws-amplify/storage";
import { useAsyncMemo } from "use-async-memo";
import { TrashIcon } from "lucide-react";
import Image from "next/image";
import { AppAvatar } from "../app-components/app-avatar";
import { useAuthContext } from "@/providers/auth-providers";
import { SOCKET_EVENT_ENUM } from "@/helpers/constants";
import Loading from "@/app/loading";

function ChatMessage({ message, userId, showAdminAsSentBy = false }: any) {
  const sendByMe = useMemo(
    () => message.senderId === userId,
    [message, userId]
  );
  const sentAt = useMemo(
    () => moment(message.createdAt).format("DD-MM-YYYY hh:ss"),
    [message]
  );
  const imageUrl = useAsyncMemo(async () => {
    if (message.attachments?.length > 0) {
      const key = message.attachments?.find((x: any) => !!x);
      if (key) {
        try {
          const res = await getUrl({ key });
          return res?.url?.href || null;
        } catch (e) {}
      }
    }
    return null;
  }, [message]);

  const sentBy = useMemo(() => {
    if (!sendByMe && showAdminAsSentBy) {
      return "Admin";
    }
    return message.sender.firstName + " " + message.sender.lastName;
  }, [message, userId, showAdminAsSentBy]);

  return (
    <div
      className={`flex items-start gap-2.5 mb-2 ${
        sendByMe ? "flex-row-reverse" : ""
      }`}
    >
      <AppAvatar
        src={message.sender.coverImage}
        alt={message.sender.firstName + message.sender.lastName}
        width={50}
        height={50}
      />
      <div
        className={`flex flex-col max-w-[540px] leading-1.5 p-4 border-new-gray-200 bg-new-gray-100 rounded-xl ${
          sendByMe ? "dark:bg-indigo-900" : "dark:bg-new-blue-900"
        } `}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-semibold text-new-gray-900 dark:text-white">
            {sentBy}
          </span>
          <span className="text-sm font-normal text-new-gray-500 dark:text-new-gray-400">
            {sentAt}
          </span>
        </div>
        {!!message.content && (
          <p className="text-sm font-normal py-2.5 text-new-gray-900 dark:text-white">
            {message.content}
          </p>
        )}
        {!!imageUrl && (
          <Image
            src={imageUrl}
            alt={imageUrl}
            className="w-60 rounded-lg my-2.5"
            width={40}
            height={40}
          />
        )}
      </div>
    </div>
  );
}

function ChatMessageList() {
  const { user } = useAuthContext();
  const {
    activeChatMessages,
    loadingChatMessage,
    isAdminPage,
    activeChatIsAdminChat,
  } = useChatContext();

  const showAdminAsSentBy = useMemo(
    () => !isAdminPage && activeChatIsAdminChat,
    [isAdminPage, activeChatIsAdminChat]
  );

  if (loadingChatMessage) return <Loading />;

  if (activeChatMessages?.length === 0) return <div>No Messages</div>;

  return activeChatMessages?.map((message, index) => (
    <ChatMessage
      message={message}
      key={index}
      userId={user?.id}
      showAdminAsSentBy={showAdminAsSentBy}
    />
  ));
}

function ChatList() {
  const {
    chatList,
    activeChatId,
    loadingChatList,
    openChatFromOtherResources,
  } = useChatContext();

  if (loadingChatList) return <Loading />;

  if (chatList?.length === 0)
    return (
      <div className="flex items-center justify-center">No Chats Found</div>
    );

  return (
    <ul className="overflow-y-auto flex-grow mt-4">
      {chatList?.map((chat) => (
        <li
          key={chat.id}
          className={`flex items-center justify-between p-2 hover:bg-new-gray-800 hover:text-white cursor-pointer my-2 ${
            activeChatId === chat.id ? "bg-new-gray-600 text-sky-200" : ""
          }`}
          onClick={() => {
            openChatFromOtherResources({ chatId: chat.id });
          }}
        >
          <AppAvatar src={chat.image} alt={chat.title} width={75} height={75} />
          <span className="ml-auto text-right">{chat.title}</span>
          {!!chat.unreadCount && (
            <span className="ml-auto bg-new-green-100 text-new-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-new-green-900 dark:text-new-green-300">
              {chat.unreadCount}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function UserChatWindow() {
  const { socket } = useSocket();
  const { user } = useAuthContext();

  const {
    chatList,
    activeChat,
    content,
    activeChatId,
    participantId,
    bookingId,
    adminChatUserId,
    fileInputRef,
    selectedImageUrl,
    activeChatIsArchived,
    isAdminPage,
    loadingSendChatMessage,
    loadingChatMessage,
    loadingOpenChat,
    setUnreadChatCount,
    openChatFromOtherResources,
    loadChatList,
    loadChatDetails,
    handleSendMessageButtonClick,
    handleContentInputChange,
    handleContentInputKeyDown,
    handleImageInputChange,
    handleUploadClearImageButtonClick,
    handleSocketEventNewMessageReceive,
    handleSocketEventNewChatCreated,
    handleSocketEventChatDeleted,
    handleDeleteChatButtonClick,
  } = useChatContext();

  useEffect(() => {
    loadChatDetails();
  }, [activeChatId]);

  useEffect(() => {
    openChatFromOtherResources({ participantId });
  }, [participantId]);

  useEffect(() => {
    openChatFromOtherResources({ bookingId });
  }, [bookingId]);
  useEffect(() => {
    openChatFromOtherResources({ adminChatUserId });
  }, [adminChatUserId]);

  useEffect(() => {
    loadChatList();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      SOCKET_EVENT_ENUM.CHAT.MESSAGE_RECEIVED_EVENT,
      handleSocketEventNewMessageReceive
    );
    socket.on(
      SOCKET_EVENT_ENUM.CHAT.NEW_CHAT_EVENT,
      handleSocketEventNewChatCreated
    );
    socket.on(
      SOCKET_EVENT_ENUM.CHAT.CHAT_DELETE_EVENT,
      handleSocketEventChatDeleted
    );
    setUnreadChatCount(0);

    return () => {
      socket.off(
        SOCKET_EVENT_ENUM.CHAT.MESSAGE_RECEIVED_EVENT,
        handleSocketEventNewMessageReceive
      );
      socket.off(
        SOCKET_EVENT_ENUM.CHAT.NEW_CHAT_EVENT,
        handleSocketEventNewChatCreated
      );
      socket.off(
        SOCKET_EVENT_ENUM.CHAT.CHAT_DELETE_EVENT,
        handleSocketEventChatDeleted
      );
    };
  }, [socket, chatList]);

  return (
    <div className="flex h-[80vh] bg-custom bg-cover bg-center rounded-xl">
      {loadingOpenChat && <Loading />}
      {/* Left Side - User List */}
      <div className="w-1/4 border-r flex flex-col">
        <div className="flex justify-between items-center align-center h-[4rem] pl-2 pr-2 border-b">
          <h2 className="text-lg font-semibold text-center">
            All Users
          </h2>
          {!isAdminPage && (
            <button
              type="button"
              className="hover:bg-new-gray-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-new-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:hover:bg-new-gray-600  dark:focus:ring-new-gray-800"
              onClick={() => {
                openChatFromOtherResources({ adminChat: true });
              }}
            >
              Talk to Admin
            </button>
          )}
        </div>
        <ChatList />
      </div>

      {!activeChatId ? (
        <div className="w-3/4 flex flex-col items-center justify-center">
          No Chat Selected
        </div>
      ) : loadingChatMessage ? (
        <div className="w-3/4 flex flex-col">
          <Loading />
        </div>
      ) : (
        <div className="w-3/4 flex flex-col">
          <div className="p-4 border-b w-full">
            {activeChat ? (
              <div className="flex justify-between items-center">
                <AppAvatar
                  src={activeChat.image}
                  alt={activeChat.title}
                  width={75}
                  height={75}
                />
                <h2 className="ml-4 text-xl font-semibold">
                  {activeChat.title}
                </h2>
                {isAdminPage &&
                  !activeChat?.deletedAt &&
                  activeChat.isGroupChat && (
                    <span
                      className="ml-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChatButtonClick(activeChat.id);
                      }}
                    >
                      <TrashIcon />
                    </span>
                  )}
              </div>
            ) : (
              <div>Loading....</div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto relative">
            <ChatMessageList />
          </div>

          {/* Message Input */}
          {activeChatIsArchived ? (
            <div className="p-4 border border-new-gray-300 flex items-center justify-center">
              Chat is Archived
            </div>
          ) : (
            <div className="p-4 border border-new-gray-300 flex items-center relative">
              {loadingSendChatMessage && <Loading />}
              {selectedImageUrl && (
                <div className="absolute bottom-[6rem] left-5 ">
                  {/* !!!!!!!! Do not change bellow img tag to Image tag*/}
                  <img src={selectedImageUrl} className="h-[15rem]" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageInputChange}
                style={{ display: "none" }}
                ref={fileInputRef}
              />
              <button
                className="mr-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                onClick={handleUploadClearImageButtonClick}
              >
                {!!selectedImageUrl ? "Clear" : "Upload"}
              </button>
              <input
                type="text"
                placeholder="Type your message..."
                value={content}
                onInput={handleContentInputChange}
                onKeyDown={handleContentInputKeyDown}
                className="flex-grow border border-new-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1"
              />
              <button
                className="text-white bg-new-gray-800 hover:bg-new-gray-900 focus:outline-none focus:ring-4 focus:ring-new-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-4 dark:bg-new-gray-800 dark:hover:bg-new-gray-700 dark:focus:ring-new-gray-700 dark:border-new-gray-700"
                onClick={handleSendMessageButtonClick}
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
      {/* Right Side - Chat Area */}
    </div>
  );
}
