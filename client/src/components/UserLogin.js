import React, { useState } from "react";
import { CommentOutlined } from "@ant-design/icons";
import _ from "lodash";
import axios from "axios";

const button = {
  width: "10%",
  height: 50,
  fontWeight: "bold",
  borderRadius: 10,
  fontSize: 18,
  backgroundColor: "#075e54",
  borderWidth: 0,
  color: "#fff",
  margin: 10,
};

export default function UserLogin({ setUserCallback }) {
  const [user, setUser] = useState({
    senderPhone: "15556116462",
    receiverPhone: "",
    userName: "Test User",
  });

  async function handleSetUser() {
    if (!user && !user.receiverPhone) return;

    // update the user data at the frontend
    localStorage.setItem("user", user);

    setUserCallback(user);

    localStorage.setItem(
      "avatarLeft",
      `https://picsum.photos/id/${_.random(1, 1000)}/200/300`
    );

    localStorage.setItem(
      "avatarRight",
      `https://picsum.photos/id/${_.random(1, 1000)}/200/300`
    );
  }

  return (
    <div>
      <h1 style={{ margin: 10, textAlign: "center" }}>
        <CommentOutlined color={"green"} /> Super Chat{" "}
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          disabled={true}
          style={{
            margin: 10,
            height: 30,
            width: "25%",
            borderRadius: 10,
            borderWidth: 10,
            fontSize: 15,
            paddingInline: 5,
          }}
          value={user.userName}
          onChange={(e) =>
            setUser((prev) => {
              return { ...prev, userName: e.target.value };
            })
          }
          placeholder="User Name"
        ></input>

        <input
          disabled={true}
          style={{
            margin: 10,
            height: 30,
            width: "25%",
            borderRadius: 10,
            borderWidth: 10,
            fontSize: 15,
            paddingInline: 5,
          }}
          value={user.senderPhone}
          onChange={(e) =>
            setUser((prev) => {
              return { ...prev, senderPhone: e.target.value };
            })
          }
          placeholder="Sender Phone Number"
        ></input>

        <input
          style={{
            margin: 10,
            height: 30,
            width: "25%",
            borderRadius: 10,
            borderWidth: 10,
            fontSize: 15,
            paddingInline: 5,
          }}
          value={user.receiverPhone}
          onChange={(e) =>
            setUser((prev) => {
              return { ...prev, receiverPhone: e.target.value };
            })
          }
          placeholder="Receiver Phone Number"
        ></input>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={handleSetUser} style={button}>
          Login
        </button>
      </div>
    </div>
  );
}
