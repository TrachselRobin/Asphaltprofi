document.addEventListener('DOMContentLoaded', function() {
    loadChats();
});

function scrollToBottom() {
    const messageList = document.querySelector('.message:last-child');
    // scroll to last item in messageList
    messageList.scrollIntoView();
}

async function loadChats() {
    const TOKEN = localStorage.getItem('token');
    const chats = await fetch(`http://localhost:3000/token/${TOKEN}`).then((response) => response.json()).then(async (data) => {
        let response = await fetch(`http://localhost:3000/user/${data[0].ID}/chats`).then((response) => response.json()).then((data) => {
            return data;
        });
        return response;
    });
    /*
    Example of a chat object:
    [
        {
            "ID": 1,
            "userID": 1000000000,
            "user2ID": 1000000001,
            "name": "Chat Name"
        },
        {
            "ID": 2,
            "userID": 1000000000,
            "user2ID": 1000000002,
            "name": "Chat Name"
        }
    ]

    HTML to create a chat element:
    <li class="chat" onclick="openChat(1)">
        <img src="./databaseImages/1.png" alt="profilepicture">
        <div>
            <h2>Max Mustermann</h2>
            <p>Hi, wie gehts?</p>
        </div>
    </li>
    */
    const chatList = document.getElementById('chatlist');
    chatList.innerHTML = '';
    
    chats.forEach(async (chat) => {
        const chatElement = document.createElement('li');
        chatElement.classList.add('chat');
        chatElement.setAttribute('onclick', `openChat(${chat.ID})`);
        const img = document.createElement('img');
        const friend = await fetch(`http://localhost:3000/user/${chat.user2ID}/cars`).then((response) => response.json()).then((data) => {
            return data[0];
        });
        img.src = `./databaseImages/${friend.image}`;
        img.alt = 'profilepicture';
        const div = document.createElement('div');
        const h2 = document.createElement('h2');
        h2.innerText = chat.name;
        const p = document.createElement('p');
        p.innerText = await fetch(`http://localhost:3000/chat/${chat.ID}/messages`).then((response) => response.json()).then((data) => {
            console.log(data);
            return data[0].text;
        });
        div.appendChild(h2);
        div.appendChild(p);
        chatElement.appendChild(img);
        chatElement.appendChild(div);
        chatElement.attributes.onClick = `openChat(${chat})`;
        chatList.appendChild(chatElement);
    });

    // get first chat id
    const firstChatID = chats[0].ID;
    openChat(firstChatID);
    scrollToBottom();
}

async function openChat(chat) {
    const chatID = chat.ID;
    const CHAT = await fetch(`http://localhost:3000/chat/${chatID}/messages`).then((response) => response.json()).then((data) => {
        return data;
    });
    const chatName = document.getElementById('chatName');
    chatName.innerText = CHAT[0].name;
    const messages = await fetch(`http://localhost:3000/chat/${chatID}/messages`).then((response) => response.json()).then((data) => {
        return data;
    });
    const messageList = document.getElementById('messages');
    messageList.innerHTML = '';
    messages.forEach(async (message) => {
        const messageElement = document.createElement('li');
        messageElement.classList.add('message');
        messageElement.innerText = message.message;
        messageList.appendChild(messageElement);
    });

    scrollToBottom();
}