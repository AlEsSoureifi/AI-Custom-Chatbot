import { React, useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import styles from "./styles.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import QABox from "../qabox/QABox";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

export default function Chat() {
  const [question, setQuestion] = useState("");
  // const [answer, setAnswer] = useState("");

  const [texts, setTexts] = useState([
    {
      message:
        "Hello, my name is {name} and I am here to help you learn anything about {anything}. Please ask me anything you like.",
      isQuestion: false,
      exactTime: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  const configuration = new Configuration({
    apiKey: "{OPENAI KEY}",
  });

  const openai = new OpenAIApi(configuration);

  const readQuestion = (event) => {
    setQuestion(event.target.value);
  };

  const generateAnswer = async () => {
    setIsLoaded(true);
    setTexts((prev) => [
      ...prev,
      {
        message: question,
        isQuestion: true,
        exactTime: new Date().toLocaleTimeString(),
      },
    ]);
    questionToEmbedding(question);
    setQuestion("");
  };

  const questionToEmbedding = async () => {
    await openai
      .createEmbedding({
        model: "text-embedding-ada-002",
        input: question,
      })
      .then((res) => {
        axios({
          method: "post",
          url: "https://localhost:7116/api/Pinecone",
          headers: {},
          data: res.data.data[0].embedding,
        }).then((response) =>
          openai
            .createCompletion({
              model: "text-davinci-003",
              prompt: `Text: '${response.data}'.Your name is {name} and you are a chat service for myAxelos website providing assistance to Axelos users. From the above text answer to the question : ${question}?`,
              temperature: 0,
              max_tokens: 1000,
              // frequency_penalty: 2,
            })
            .then((resp) => {
              // setAnswer(resp.data.choices[0].text);
              setTexts((prev) => [
                ...prev,
                {
                  message: resp.data.choices[0].text,
                  isQuestion: false,
                  exactTime: new Date().toLocaleTimeString(),
                },
              ]);
              setIsLoaded(false);
            })
        );
      });
  };

  const onEnterPress = (e) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      generateAnswer();
    }
  };

  const clearHistory = () => {
    setTexts([]);
  };

  return (
    <div className="container" id="section">
      <h3 className={styles.myHeading}>Ask anything about 'anything'...</h3>
      <Form.Control
        className="myInput"
        as="textarea"
        onKeyDown={onEnterPress}
        value={question}
        rows={1}
        onChange={readQuestion}
        style={{
          borderStyle: "none !important",
          resize: "none",
          borderColor: "transparent",
          overflow: "auto",
        }}
      />
      <br />
      <div className="buttons">
        <Button
          style={{ backgroundColor: "#6de2e2", border: "none" }}
          id="buttonAnswer"
          type="submit"
          onClick={generateAnswer}
          variant="danger"
          size="lg"
        >
          Send
        </Button>
        <Button
          onClick={clearHistory}
          size="lg"
          id="buttonClear"
          style={{ backgroundColor: "#ce2d4f", border: "none" }}
        >
          Clear
        </Button>
      </div>
      {isLoaded && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
      {texts.length > 0 &&
        texts.map((text) => <QABox key={text.index} text={text}></QABox>)}
    </div>
  );
}
