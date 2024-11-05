const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("Connection Successful");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/message", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      io.emit("geminiResponse", "Please provide a message");

      return res.status(400).json({
        success: false,
        message: "Please enter a message",
      });
    }

    const genAI = new GoogleGenerativeAI(
      "gemini_key"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    io.emit("geminiResponse", responseText);

    res.send({ success: true, message: responseText });
  } catch (error) {
    io.emit("geminiResponse", "Error in generating response");

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

server.listen(5000, () => {
  console.log("Server is running");
});
