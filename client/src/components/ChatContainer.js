import React, { useEffect, useState, useRef, useCallback } from "react";
import ChatBoxReciever, { ChatBoxSender } from "./ChatBox";
import InputText from "./InputText";
import UserLogin from "./UserLogin";
import { serverTimestamp } from "firebase/firestore";
import axios from "axios";
import Utils from "../utils/utils.js";

export default function ChatContainer() {
  // let socketio = socketIOClient("http://localhost:5001");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(localStorage.getItem("user"));
  const avatar = localStorage.getItem("avatar");
  // const chatsRef = collection(db, "Messages");
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = useCallback(async () => {
    const convId = Utils.getConvId(user.senderPhone, user.receiverPhone);

    const conversation = await axios({
      method: "get",
      url: `http://localhost:3001/conversations/${convId}`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    setMessages([...conversation.data]);
  }, [user.receiverPhone, user.senderPhone]);

  async function addMessage(chat) {
    if (!chat) return;

    //
    const response = await axios({
      method: "post",
      url: `http://localhost:3001/message`,
      data: {
        to: user.receiverPhone,
        text: chat.message,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    await loadConversations();
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    setUser("");
  }

  const refresh = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  function ChatsList() {
    return (
      <div style={{ height: "75vh", overflow: "scroll", overflowX: "hidden" }}>
        {messages &&
          messages.map((message, index) => {
            if (message.sender_id === user.senderPhone)
              return (
                <ChatBoxSender
                  key={index}
                  message={message.message_text}
                  avatar={avatar}
                  user={message.sender_id}
                />
              );
            return (
              <ChatBoxReciever
                key={index}
                message={message.message_text}
                avatar={avatar}
                user={message.receiver_id}
              />
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    );
  }

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div>
      {user.receiverPhone ? (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h4>Username: {user.userName}</h4>

            <p
              onClick={() => refresh()}
              style={{ color: "blue", cursor: "pointer" }}
            >
              Refresh
            </p>
            <p
              onClick={() => logout()}
              style={{ color: "blue", cursor: "pointer" }}
            >
              Log Out
            </p>
          </div>
          <ChatsList />

          <InputText addMessage={addMessage} />
        </div>
      ) : (
        <UserLogin setUserCallback={setUser} />
      )}
    </div>
  );
}
