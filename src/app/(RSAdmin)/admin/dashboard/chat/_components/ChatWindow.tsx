"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
} from "@mui/material";
// import { styled } from '@mui/system';
import { styled } from "@mui/material/styles";
import { useSocket } from "@/providers/SocketProvider";
import { useChatContext } from "@/providers/ChatDataProvider";
import moment from "moment";
import { getUrl } from "aws-amplify/storage";
import { useAsyncMemo } from "use-async-memo";
import IconButton from "@mui/material/IconButton";
import { DeleteIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

const RootContainer = styled(Box)({
  display: "flex",
  border: "1px solid #ccc",
  height: "80vh",
});

const UserListContainer = styled(Box)({
  width: "25%",
  border: "1px solid #ccc",
  display: "flex",
  flexDirection: "column",
});

const UserListHeader = styled(Box)({
  padding: "16px",
  border: "1px solid #ccc",
});

const UserList = styled(List)({
  overflowY: "auto",
  flexGrow: 1,
});

const ChatContainer = styled(Box)({
  width: "75%",
  display: "flex",
  flexDirection: "column",
});

const ChatHeader = styled(Box)({
  padding: "16px",
  borderBottom: "1px solid #ccc",
  display: "flex",
  alignItems: "center",
});

const MessagesContainer = styled(Box)({
  flexGrow: 1,
  padding: "16px",
  overflowY: "auto",
  backgroundColor: "#f5f5f5",
});

const MessageInputContainer = styled(Box)({
  padding: "16px",
  borderTop: "1px solid #ccc",
  display: "flex",
  alignItems: "center",
});

// Selected user details
const selectedUser = {
  name: "Alice",
  avatar: "https://via.placeholder.com/40",
};

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
  return (
    <Box
      display="flex"
      flexDirection={sendByMe ? "row-reverse" : "row"}
      alignItems="flex-start"
      marginBottom="8px"
      gap="8px"
    >
      <Avatar src={userAvatar} />
      <Box
        display="flex"
        bgcolor={sendByMe ? "primary.main" : "grey.300"}
        color={sendByMe ? "primary.contrastText" : "text.primary"}
        padding="8px 12px"
        borderRadius="16px"
        maxWidth="60%"
        flexDirection="column"
      >
        {!sendByMe && (
          <Typography variant="caption" fontWeight="bold">
            {sentBy}
          </Typography>
        )}
        {!!imageUrl && (
          <Image src={imageUrl} alt="" className="w-full mt-2 mb-2" />
        )}

        <Typography variant="body1">{message.content}</Typography>
        <Typography variant="caption" marginLeft="auto">
          {sentAt}
        </Typography>
      </Box>
    </Box>
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
  handleDeleteChat,
}: {
  chatList: any[] | null;
  activeChatId: any;
  goToChat: Function;
  handleDeleteChat: Function;
}) {
  console.log("ChatList", { chatList });
  if (chatList === null || chatList === undefined)
    return <div>Loading....</div>;

  if (chatList?.length === 0) return <div>No Chats Found</div>;

  return (
    <List>
      {chatList.map((chat) => (
        <ListItem
          key={chat.id}
          disablePadding
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleDeleteChat(chat.id)}
            >
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemButton
            // alignItems="flex-start"
            onClick={() => {
              goToChat(chat.id);
            }}
            selected={chat.id === activeChatId}
          >
            <ListItemAvatar>
              <Avatar src={userAvatar} />
            </ListItemAvatar>
            <ListItemText style={{ overflow: "hidden" }} primary={chat.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

function ChatWindow() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const userId = user?.id;
  const {
    chatList,
    activeChat,
    content,
    activeChatId,
    participantId,
    bookingId,
    fileInputRef,
    activeChatMessages,
    selectedImageUrl,
    openChatFromOtherResources,
    loadChatList,
    loadChatDetails,
    handleSendMessageButtonClick,
    handleDeleteChatButtonClick,
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
    openChatFromOtherResources({ bookingId });
  }, [bookingId]);

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
    <RootContainer>
      {/* Left Side - User List */}
      <UserListContainer>
        <UserListHeader>
          <Typography variant="h6">All Users</Typography>
        </UserListHeader>
        <ChatList
          chatList={chatList}
          activeChatId={activeChatId}
          goToChat={(chatId: string) => openChatFromOtherResources({ chatId })}
          handleDeleteChat={handleDeleteChatButtonClick}
        />
      </UserListContainer>

      {/* Right Side - Chat Area */}
      {!activeChatId ? (
        <div>No Chat Selected</div>
      ) : (
        <ChatContainer>
          {/* Chat Header */}
          <ChatHeader>
            <Avatar src={selectedUser.avatar} />
            <Typography variant="h6" style={{ marginLeft: "16px" }}>
              {selectedUser.name}
            </Typography>
          </ChatHeader>

          {/* Messages Area */}
          <MessagesContainer>
            <ChatMessageList
              activeChatMessages={activeChatMessages}
              userId={userId}
            />
          </MessagesContainer>

          {/* Message Input */}
          <MessageInputContainer style={{ position: "relative" }}>
            {selectedImageUrl && (
              <div className="absolute bottom-[6rem] left-5 ">
                <Image src={selectedImageUrl} alt="" className="h-[15rem]" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              style={{ display: "none" }}
              ref={fileInputRef}
            />
            <Button
              variant="contained"
              color="secondary"
              style={{ marginRight: "8px" }}
              onClick={handleUploadClearImageButtonClick}
            >
              {!!selectedImageUrl ? "Clear" : "Upload"}
            </Button>
            <TextField
              variant="outlined"
              placeholder="Type your message..."
              fullWidth
              value={content}
              onInput={handleContentInputChange}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "8px" }}
              onClick={handleSendMessageButtonClick}
            >
              Send
            </Button>
          </MessageInputContainer>
        </ChatContainer>
      )}
    </RootContainer>
  );
}

export default ChatWindow;
