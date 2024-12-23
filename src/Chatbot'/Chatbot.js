import React, { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [responseButtons, setResponseButtons] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    if (selectedModel && !serialNumber) {
      handleSerialNumberInput(input.trim());
    } else {
      setMessages([...messages, { sender: "user", text: input }]);
      if (input.trim().toLowerCase() === "create") {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Choose a product:" },
        ]);
        getProductDetails();
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "I didn't understand that. Try 'create'." },
        ]);
      }
    }
    setInput("");
  };

  const handleSerialNumberInput = (serial) => {
    setSerialNumber(serial);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `You entered serial number: ${serial}` },
      { sender: "bot", text: `Serial number "${serial}" recorded.` },
    ]);
    setResponseButtons([]);
    fetchDepartments();
  };

  const getProductDetails = () => {
    const payload = {
      json_type: "product name",
      make: "Schwing",
    };

    axios
      .post(
        "https://smartrack-api.schwingcloud.com/RestServiceImpl.svc/Ticktes__Master",
        JSON.stringify(payload)
      )
      .then((res) => {
        const jsonDetails = JSON.parse(res.data);
        if (jsonDetails.json_status === "1") {
          setResponseButtons(jsonDetails.data);
        } else {
          alert(jsonDetails.error_msg);
        }
      })
      .catch((error) => {
        console.error("API call error:", error);
        alert("An error occurred while fetching product details.");
      });
  };

  const getModelDetails = (prodCode) => {
    const payload = {
      json_type: "model name",
      make: "Schwing",
      appn: "tkt",
      prod_code: prodCode,
    };

    axios
      .post(
        "https://smartrack-api.schwingcloud.com/RestServiceImpl.svc/Ticktes__Master",
        JSON.stringify(payload)
      )
      .then((res) => {
        const jsonDetails = JSON.parse(res.data);
        if (jsonDetails.json_status === "1") {
          setResponseButtons(jsonDetails.data);
        } else {
          alert(jsonDetails.error_msg);
        }
      })
      .catch((error) => {
        console.error("API call error:", error);
        alert("An error occurred while fetching machine models.");
      });
  };

  const fetchDepartments = () => {
    const payload = {
      json_type: "team list",
    };

    axios
      .post(
        "https://smartrack-api.schwingcloud.com/RestServiceImpl.svc/Ticktes__Master",
        JSON.stringify(payload)
      )
      .then((res) => {
        let jsonDetails = JSON.parse(res.data);
        if (jsonDetails.json_status === "1") {
          setResponseButtons(jsonDetails.data);
        } else {
          alert(jsonDetails.error_msg);
        }
      })
      .catch((error) => {
        console.error("API call error:", error);
        alert("An error occurred while fetching product details.");
      });
  };

  const handleProductSelection = (product) => {
    setSelectedProduct(product);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `You selected: ${product.name}` },
    ]);
    setResponseButtons([]);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Choose a machine model:" },
    ]);
    getModelDetails(product.code);
  };

  const handleModelSelection = (model) => {
    setSelectedModel(model);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `You selected: ${model.name}` },
    ]);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Enter the machine serial number:" },
    ]);
    setResponseButtons([]);
  };

  const handleDepartmentSelection = (department) => {
    setSelectedDepartment(department);
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: `You selected the department: ${department.name}`,
      },
    ]);
    setResponseButtons([]);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(msg.sender === "user"
                  ? styles.userMessage
                  : styles.botMessage),
              }}
            >
              {msg.text}
            </div>
          ))}
          <div style={styles.buttonContainer}>
            {responseButtons.map((button, index) => (
              <button
                key={index}
                style={styles.responseButton}
                onClick={() =>
                  selectedProduct
                    ? selectedModel
                      ? handleDepartmentSelection(button)
                      : handleModelSelection(button)
                    : handleProductSelection(button)
                }
              >
                {button.name}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder={
              selectedModel && !serialNumber
                ? "Enter serial number"
                : "Type a message"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSendMessage} style={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#e5ddd5",
  },
  container: {
    width: "800px",
    height: "600px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f0f0f0",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  chatWindow: {
    flex: 3,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: "18px",
    wordWrap: "break-word",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
  },
  inputContainer: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "20px",
    outline: "none",
    marginRight: "10px",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  responseButton: {
    padding: "10px",
    backgroundColor: "#f1f1f1",
    border: "1px solid #ddd",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ChatBot;
