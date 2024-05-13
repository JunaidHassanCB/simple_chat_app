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
  const avatarLeft = localStorage.getItem("avatarLeft");
  const avatarRight = localStorage.getItem("avatarRight");
  // const chatsRef = collection(db, "Messages");
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = useCallback(async () => {
    if (!user.senderPhone && !user.receiverPhone) return;

    const convId = Utils.getConvId(user.senderPhone, user.receiverPhone);

    const conversation = await axios({
      method: "get",
      url: `http://localhost:3001/conversations/${convId}`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    setMessages([...conversation.data]);

    if (conversation.data.length === 0) {
      // set http request to start the conversation
      const response = await axios({
        method: "post",
        url: "http://localhost:3001/init-conversations",
        data: {
          to: user.receiverPhone,
          templateName: "citrus_bits_util",
          headerValues: ["Obi Wan Kenobi"],
          bodyValues: ["General Grievous", "the Empire", "demise"],
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      await loadConversations();
    }
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
    localStorage.removeItem("avatarLeft");
    localStorage.removeItem("avatarRight");
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
                  avatar={avatarLeft}
                  user={message.sender_id}
                />
              );
            return (
              <ChatBoxReciever
                key={index}
                message={message.message_text}
                avatar={avatarRight}
                user={message.sender_id}
              />
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    );
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
