import { Col, Container, Row } from "react-bootstrap";
import bgImage from "../images/bg-img.jpg";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import jwt_decode from "jwt-decode";
import { useParams } from "react-router";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { getMessagesApi, newMessage } from "../utils/api";
import React, { useEffect, useState } from "react";
import { Message, User, ChatType } from "../types";
import { io, Socket } from "socket.io-client";
import { addMessage } from "../redux/messageSlice";
import { getChatsApi } from "../utils/api";

const Chat = ({ socket }: { socket: Socket }) => {
  const { id } = useParams();

  const messages = useAppSelector((state) => state.messages.messages);
  const dispatch = useAppDispatch();

  const [currentUser, setCurrentUser] = useState<User>();
  useEffect(() => {
    getChatsApi(dispatch);
    setCurrentUser(
      jwt_decode(JSON.parse(localStorage.getItem("token") as string))
    );
  }, []);
  const chatList = useAppSelector((state) => state.chats.chats);
  const chat = chatList.find((chat: ChatType) => chat.id == id);
  const users = chat?.users;
  const userIds = users?.map((user) => user.id);
  console.log(users)
  useEffect(() => {
    getMessagesApi(dispatch, id!);
    socket?.on("new message", (msg) => {
      dispatch(addMessage(msg));
    });
  }, [socket]);

  //message body
  const [body, setBody] = useState("");

  return (
    <>
      <div
        style={{ height: "60px", backgroundColor: "#f9f9f9", color: "grey" }}
        className="text-start ps-5"
      >
        <h1>Chat</h1>
      </div>
      <div
        style={{
          backgroundImage: `url(${bgImage}`,
          backgroundSize: "cover ",
          backgroundRepeat: "no-repeat",
          width: "100%",
        }}
        className="min-vh-100"
      >
        <Container>
          <Card className="min-vh-100">
            <Card.Body style={{ backgroundColor: "#EEE" }}>
              {messages.map((message: Message, idx) => (
                <Row
                  key={idx}
                  lg="1"
                  md="1"
                  className={
                    message.user?.email == currentUser?.email
                      ? "justify-content-end d-flex mt-3"
                      : "justify-content-start d-flex mt-3"
                  }
                >
                  <Col lg="7" md="7" style={{ backgroundColor: "white" }}>
                    <div>{message.user?.firstName}</div>
                    <div>{message.body}</div>
                    <span style={{ float: "right" }}>7:02 pm</span>
                  </Col>
                </Row>
              ))}
            </Card.Body>
            <Card.Footer>
              <Form.Group
                className="mb-3 d-flex justify-content-between"
                controlId="message"
              >
                <Form.Control
                  as="textarea"
                  type="message"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <Button
                  variant="dark"
                  type="button"
                  className="ms-2"
                  onClick={() => {
                    newMessage(id!, body, dispatch);
                    socket?.emit("message", { body, userIds });
                    setBody("");
                  }}
                >
                  Send
                </Button>
              </Form.Group>
            </Card.Footer>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default Chat;
function MessagesState(msg: any): any {
  throw new Error("Function not implemented.");
}
