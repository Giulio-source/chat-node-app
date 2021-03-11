const socket = io("http://localhost:3000");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const messageContainer = document.getElementById("message-container");
const roomName = document.getElementById("room-name");
const roomsContainer = document.getElementById("rooms-container");

if (messageForm) {
  const nameSender = prompt("What is your name?");
  createMessage({ message: "You joined", name: "" });
  socket.emit("new-user", room, nameSender);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit("send-chat-message", room, message);
    createMessage({ message: message, name: nameSender }, "messaggio-self");
    messageInput.value = "";
  });
}

socket.on("room-created", (room) => {
  const containerElement = document.createElement("div");
  containerElement.classList.add("card", "my-2");
  containerElement.style = "width:18rem";
  const divElement = document.createElement("div");
  divElement.classList.add("card-header");
  divElement.innerText = room;
  containerElement.appendChild(divElement);
  const pElement = document.createElement("p");
  pElement.classList.add("list-group-item");
  const aElement = document.createElement("a");
  aElement.href = `/${room}`;
  aElement.innerText = "Join";
  pElement.appendChild(aElement);
  containerElement.append(pElement);
  roomsContainer.appendChild(containerElement);
  // <div class="card my-2" style="width: 18rem">
  //         <div class="card-header"><%= room %></div>
  //         <p class="list-group-item"><a href="<%= room %>">Join</a></p>
  //       </div>
});

socket.on("chat-message", (data) => {
  createMessage(data, "messaggio-other");
});

socket.on("new-user-message", (name) => {
  createMessage({ message: `${name} joined`, name: "" });
});

socket.on("user-disconnected", (name) => {
  createMessage({ message: `${name} disconnected`, name: "" });
});

function createMessage(message, className = "joined-message") {
  const newDiv = document.createElement("div");
  console.log(room);
  newDiv.classList.add(className);
  newDiv.innerHTML = `${message.message}<span class="author-name">${message.name}</span>`;
  messageContainer.appendChild(newDiv);
}
