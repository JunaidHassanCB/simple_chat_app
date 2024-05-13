import React, { useEffect, useState, useRef, useCallback } from "react";
import ChatBoxReciever, { ChatBoxSender } from "./ChatBox";
import InputText from "./InputText";
import UserLogin from "./UserLogin";
import { serverTimestamp } from "firebase/firestore";
import axios from "axios";
import Utils from "../utils/utils.js";

// import WhatsApp from "whatsapp";

// const senderNumber = 12345678901234567890;
// const wa = new WhatsApp();

// function custom_callback(statusCode, headers, body, resp, err) {
//   console.log(
//     `Incoming webhook status code: ${statusCode}\n\nHeaders:
//         ${JSON.stringify(headers)}\n\nBody: ${JSON.stringify(body)}`
//   );

//   if (resp) {
//     resp.writeHead(200, { "Content-Type": "text/plain" });
//     resp.end();
//   }

//   if (err) {
//     console.log(`ERROR: ${err}`);
//   }
// }

// wa.webhooks.start(custom_callback);

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

  // useEffect(() => {
  //   socketio.on("chat", (senderChats) => {
  //     setMessages(senderChats);
  //   });
  // });

  // useEffect(() => {
  //   const q = query(chatsRef, orderBy("createdAt", "asc"));

  //   const unsub = onSnapshot(q, (querySnapshot) => {
  //     const fireChats = [];
  //     querySnapshot.forEach((doc) => {
  //       fireChats.push(doc.data());
  //     });
  //     setMessages([...fireChats]);
  //   });
  //   return () => {
  //     unsub();
  //   };
  // }, []);

  function addToFirrebase(chat) {
    const newChat = {
      avatar,
      createdAt: serverTimestamp(),
      user,
      message: chat.message,
    };

    // const chatRef = doc(chatsRef);
    // setDoc(chatRef, newChat)
    //   .then(() => console.log("Chat added succesfully"))
    //   .catch(console.log);
  }

  function sendChatToSocket(chat) {
    // socketio.emit("chat", chat);
  }

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

    // // addToFirrebase(chat);
    // setChats([...messages, newChat]);
    // // sendChatToSocket([...messages, newChat]);
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
            console.log(message.message_text);

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
            <strong>
              Remember to Subscribe to{" "}
              <a href="https://www.youtube.com/channel/UCmoQtgmJ2SHEAPCAR1Q8TBA">
                {" "}
                My Channel
              </a>
            </strong>
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

      {/* <div style={{ margin: 10, display: "flex", justifyContent: "center" }}>
        <small
          style={{ backgroundColor: "lightblue", padding: 5, borderRadius: 5 }}
        >
          Interested in some 1 on 1 Coding Tutorials and Mentorship. Lets chat
          on Discord: <strong> kutlo_sek#5370 </strong>
        </small>
      </div> */}
    </div>
  );
}
