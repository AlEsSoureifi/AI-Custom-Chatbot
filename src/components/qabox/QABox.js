import React from "react";

import styles from "./style.css";

export default function QABox({ text }) {
  var exactTime = new Date().toLocaleTimeString();
  const colorClass = text.isQuestion ? "container lighter" : "container darker";
  const imageToggle = !text.isQuestion
    ? "icons8-chatbot-94.png"
    : "Sample_User_Icon.png";

  return (
    <div className={colorClass}>
      <img src={imageToggle} alt="Avatar" className="left" />

      <p>{text.message}</p>
      <span className="time-right">{text.exactTime}</span>
    </div>
  );
}
