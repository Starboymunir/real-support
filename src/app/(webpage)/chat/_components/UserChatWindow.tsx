"use client";

import React, { useEffect, useMemo } from "react";
import { useChatContext } from "@/providers/ChatDataProvider";
import { useSocket } from "@/providers/SocketProvider";
import moment from "moment/moment";
import { getUrl } from "aws-amplify/storage";
import { useAsyncMemo } from "use-async-memo";
import Image from "next/image";
import { useAuthContext } from "@/providers/auth-providers";

const userAvatar = "https://via.placeholder.com/40";
const NEW_CHAT_EVENT = "NEW_CHAT_EVENT";
const MESSAGE_RECEIVED_EVENT = "MESSAGE_RECEIVED_EVENT";
const CHAT_DELETE_EVENT = "CHAT_DELETE_EVENT";

function ChatMessage({ message, userId }: any) {
  const sendByMe = useMemo(
    () => message.senderId === userId,
    [message, userId]
  );
  const sentAt = useMemo(
    () => moment(message.createdAt).format("DD-mm-YYYY hh:ss"),
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
  const sentBy = useMemo(
    () => message.sender.firstName + " " + message.sender.lastName,
    [message, userId]
  );
  console.log({ imageUrl });
  return (
    <div className={`flex mb-4 gap-2 ${sendByMe ? "flex-row-reverse" : ""}`}>
      {/* Left-side avatar for friend's messages */}
      <Image
        src={userAvatar}
        alt={userAvatar}
        className="w-8 h-8 rounded-full mt-1"
        width={40}
        height={40}
      />

      <div
        className={`flex flex-col gap-1 max-w-xs px-4 py-2 rounded-lg ${
          sendByMe ? "bg-blue text-white" : "bg-indigo-500 text-white"
        }`}
      >
        {!sendByMe && (
          <small className="font-bold text-xs text-left">{sentBy}</small>
        )}
        {!!imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            className="w-full"
            width={40}
            height={40}
          />
        )}
        <div>{message.content}</div>
        <small className="text-xs text-right">{sentAt}</small>
      </div>
    </div>
  );
}

function ChatMessageList({
  activeChatMessages,
  userId,
}: {
  activeChatMessages: any[] | null;
  userId: any;
}) {
  if (activeChatMessages === null || activeChatMessages === undefined)
    return <div>Loading....</div>;

  if (activeChatMessages?.length === 0) return <div>No Messages</div>;

  return activeChatMessages.map((message, index) => (
    <ChatMessage message={message} key={index} userId={userId} />
  ));
}

function ChatList({
  chatList,
  activeChatId,
  goToChat,
}: {
  chatList: any[] | null;
  activeChatId: any;
  goToChat: Function;
}) {
  if (chatList === null || chatList === undefined)
    return <div>Loading....</div>;

  if (chatList?.length === 0) return <div>No Chats Found</div>;

  return (
    <ul className="overflow-y-auto flex-grow">
      {chatList.map((chat) => (
        <li
          key={chat.id}
          className={`flex items-center p-4 hover:bg-blue cursor-pointer ${
            activeChatId === chat.id ? "bg-blue" : ""
          }`}
          onClick={() => {
            goToChat(chat.id);
          }}
        >
          <Image
            src="https://via.placeholder.com/40"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
            alt=""
          />
          <span className="ml-4">{chat.title}</span>
        </li>
      ))}
    </ul>
  );
}

export default function UserChatWindow() {
  const { socket } = useSocket();
  const { userId } = useAuthContext();
  const {
    chatList,
    activeChat,
    content,
    activeChatId,
    participantId,
    fileInputRef,
    activeChatMessages,
    selectedImageUrl,
    openChatFromOtherResources,
    loadChatList,
    loadChatDetails,
    handleSendMessageButtonClick,
    handleContentInputChange,
    handleImageInputChange,
    handleUploadClearImageButtonClick,
    handleSocketEventNewMessageReceive,
    handleSocketEventNewChatCreated,
    handleSocketEventChatDeleted,
  } = useChatContext();

  useEffect(() => {
    loadChatDetails();
  }, [activeChatId]);

  useEffect(() => {
    openChatFromOtherResources({ participantId });
  }, [participantId]);

  useEffect(() => {
    loadChatList();
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on(MESSAGE_RECEIVED_EVENT, handleSocketEventNewMessageReceive);
    socket.on(NEW_CHAT_EVENT, handleSocketEventNewChatCreated);
    socket.on(CHAT_DELETE_EVENT, handleSocketEventChatDeleted);

    return () => {
      socket.off(MESSAGE_RECEIVED_EVENT, handleSocketEventNewMessageReceive);
      socket.off(NEW_CHAT_EVENT, handleSocketEventNewChatCreated);
      socket.off(CHAT_DELETE_EVENT, handleSocketEventChatDeleted);
    };
  }, [socket, chatList]);

  return (
    <div className="flex h-[80vh] border border-gray-300 bg-gray-100">
      {/* Left Side - User List */}
      <div className="w-1/4 border border-gray-300 flex flex-col">
        <div className="p-4 border border-gray-300">
          <h2 className="text-xl font-semibold">All Users</h2>
        </div>

        <ChatList
          chatList={chatList}
          activeChatId={activeChatId}
          goToChat={(chatId: string) => openChatFromOtherResources({ chatId })}
        />
      </div>

      {!activeChatId ? (
        <div className="w-3/4 flex flex-col">No Chat Selected</div>
      ) : (
        <div className="w-3/4 flex flex-col">
          <div className="p-4 border border-gray-300 flex items-center">
            {activeChat ? (
              <>
                <Image
                  src="https://via.placeholder.com/40"
                  width={40}
                  height={40}
                  alt={activeChat.title}
                  className="w-10 h-10 rounded-full"
                />
                <h2 className="ml-4 text-xl font-semibold">
                  {activeChat.title}
                </h2>
              </>
            ) : (
              <div>Loading....</div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto bg-gray-100">
            <ChatMessageList
              activeChatMessages={activeChatMessages}
              userId={userId}
            />
          </div>

          {/* Message Input */}
          <div className="p-4 border border-gray-300 flex items-center relative">
            {selectedImageUrl && (
              <div className="absolute bottom-[6rem] left-5 ">
                <Image
                  src={selectedImageUrl}
                  alt=""
                  className="h-[15rem]"
                  width={40}
                  height={40}
                />
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
              className="mr-4 bg-white/10 text-white/70 hover:bg-white/20 px-4 py-2 rounded-lg"
              onClick={handleUploadClearImageButtonClick}
            >
              {!!selectedImageUrl ? "Clear" : "Upload"}
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              value={content}
              onInput={handleContentInputChange}
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={handleSendMessageButtonClick}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {/* Right Side - Chat Area */}
    </div>
  );
}
