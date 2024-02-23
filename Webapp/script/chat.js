let currentChat;
let chatList;
let user;

async function onStart() {
    currentChat = null;
    chatList = [];
    user = await getUser();
    user = user[0];
    loadChats();
}

document.addEventListener('DOMContentLoaded', function() {
    const LOADER = document.getElementById('loader');
    LOADER.classList.remove('hidden');
    onStart();

    const MESSAGEINPUT = document.getElementById('message');
    MESSAGEINPUT.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
        // if message is longer than 1000 characters, prevent user from typing more
        if (MESSAGEINPUT.value.length > 1000) {
            MESSAGEINPUT.value = MESSAGEINPUT.value.substring(0, 1000);
        }
    });

    const SUBMITCHAT = document.getElementById('submitModal');
    const CANCELCHAT = document.getElementById('cancleModal');

    CANCELCHAT.addEventListener('click', function() {
        const CHATDIALOG = document.getElementById('addChatDialog');
        CHATDIALOG.close();
    });

    SUBMITCHAT.addEventListener('click', function() {
        createChat();
    });

    // check every 5 seconds for new messages. if there are new messages, update chatList and show new messages
    setInterval(async function() {
        if (currentChat) {
            const response = await fetch(`http://localhost:3000/chat/${currentChat}/messages`);
            const data = await response.json();
            const chat = getChat(currentChat);
            if (data.length > chat.messages.length) {
                chat.messages = data;
                showMessages(data);
            }
        }
    }, 5000);
});

async function getUser() {
    // fetch user: http://localhost:3000/verify/${localStorage.getItem('token')
    const response = await fetch(`http://localhost:3000/token/${sessionStorage.getItem('token')}`);
    const data = await response.json();
    return data;
}

function scrollToBottom() {
    const messageList = document.querySelector('.message:last-child');
    messageList.scrollIntoView();
}

async function loadChats() {
    // fetch chats: http://localhost:3000/user/1000000000/chats
    const response = await fetch(`http://localhost:3000/user/${user.ID}/chats`);
    const data = await response.json();
    
    chatList.push(...data);

    // give every chat a message property, which stores all messages of the chat. But set it to null for now.
    for (let i = 0; i < chatList.length; i++) {
        chatList[i].messages = {};
    }

    showChats();
    
    const LOADER = document.getElementById('loader');
    LOADER.classList.add('hidden');
}

async function openChat(chatID) {
    currentChat = chatID;

    const screenWidth = window.innerWidth;
    if (screenWidth < 1000) {
        const section = document.querySelector('body section');
        section.style.right = "0";
    }

    if (getChat(chatID).messages.length > 0) {
        showMessages(getChat(chatID).messages);
    } else {
        const response = await fetch(`http://localhost:3000/chat/${chatID}/messages`);
        const data = await response.json();
        getChat(chatID).messages = data;
    }

    showMessages(getChat(chatID).messages);
}

async function showMessages(messages) {
    const messageList = document.getElementById('messages');
    messageList.innerHTML = '';

    for (let i = 0; i < messages.length; i++) {
        const messageElement = createMessageElement(messages[i]);
        messageList.appendChild(messageElement);
    }

    scrollToBottom();
}

async function sendMessage() {
    const messageInput = document.getElementById('message'); 
    if (messageInput.value.length === 0) {
        return;
    }
    const text = messageInput.value;
    const chatID = currentChat;
    const userID = user.ID;
    messageInput.value = '';

    const message = {
        userID: userID,
        text: text,
        chatID: chatID
    };

    const response = await fetch(`http://localhost:3000/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });

    if (response.status !== 200) {
        console.error('Error sending message');
        return;
    }

    getChat(chatID).messages.push(message);

    const messageElement = createMessageElement(message);
    const messageList = document.getElementById('messages');
    messageList.appendChild(messageElement);

    scrollToBottom();
}

function createMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (message.userID === user.ID) {
        messageElement.classList.add('user');
    } else {
        messageElement.classList.add('friend');
    }
    const p = document.createElement('p');
    p.innerHTML = message.text;
    messageElement.appendChild(p);
    return messageElement;
}

async function createChat() {
    const friendID = document.getElementById('chatName').value;
    const response = await fetch(`http://localhost:3000/user/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userID: user.ID,
            friendID: friendID
        })
    });

    let text = await response.text();

    if (response.status !== 200) {
        const error = document.getElementById('error');
        error.innerText = text;
        return;
    }

    const CHATDIALOG = document.getElementById('addChatDialog');
    CHATDIALOG.close();

    loadChats();
}

function showChats() {
    /* 
        HTML for one chat:
        <li class="chat" onclick="openChat(chatID)">
            <img src="./databaseImages/" alt="profilepicture">
            <div>
                <h2>Max Mustermann</h2>
                <p>Hi, wie gehts?</p>
            </div>
        </li>
    */
    const chatListElement = document.getElementById('chatlist');
    chatListElement.innerHTML = '';
    chatList.forEach(async (chat) => {
        let userID;
        let friendID;
        if (chat.userID === user.ID) {
            userID = chat.userID;
            friendID = chat.user2ID;
        } else {
            userID = chat.user2ID;
            friendID = chat.userID;
        }

        // get username of friend
        let response = await fetch(`http://localhost:3000/user/${friendID}`);
        let data = await response.json();

        const chatElement = document.createElement('li');
        chatElement.classList.add('chat');
        chatElement.onclick = () => openChat(chat.ID);
        const img = document.createElement('img');
        img.src = `./databaseImages/${chat.ID}.png`;
        img.alt = 'profilepicture';
        const div = document.createElement('div');
        const h2 = document.createElement('h2');
        h2.innerText = data[0].username;
        const CHATTITLE = document.getElementById('chatTitle');
        CHATTITLE.innerText = data[0].username;
        const p = document.createElement('p');
        // chat.lastMessage.text might be undefined. Check if it exists before accessing it.
        if (chat.lastMessage && chat.lastMessage.text) {
            if (chat.lastMessage.text.length > 22) {
                p.innerText = chat.lastMessage.text.substring(0, 21) + '...';
            } else {
                p.innerText = chat.lastMessage.text;
            }
        } else {
            p.innerText = '';
        }
        div.appendChild(h2);
        div.appendChild(p);
        chatElement.appendChild(img);
        chatElement.appendChild(div);
        chatListElement.appendChild(chatElement);
    });

    // open first chat with showMessages
    if (chatList.length > 0 && window.innerWidth === 1000) {
        openChat(chatList[0].ID);
    }
}

async function addChat() {
    const CHATDIALOG = document.getElementById("addChatDialog");
    const CHATDIALOGCANCEL = document.getElementById("cancleModal");
    const CHATDIALOGSUBMIT = document.getElementById("submitModal");

    const SELECT = document.getElementById("chatName"); // select element

    // fetch all friends and add them to the select element as an option element
    // fetch friends: http://localhost:3000/user/1000000000/friends
    const response = await fetch(`http://localhost:3000/user/${user.ID}/friends`);
    const data = await response.json();
    
    data.forEach((friend) => {
        const option = document.createElement("option");
        option.value = friend.ID;
        option.text = "@" + friend.username;
        SELECT.appendChild(option);
    });

    CHATDIALOG.showModal();

    CHATDIALOGCANCEL.addEventListener('click', function() {
        CHATDIALOG.close();
    });

    CHATDIALOGSUBMIT.addEventListener('click', async function() {
        const friendID = SELECT.value;
        const response = await fetch(`http://localhost:3000/user/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: user.ID,
                friendID: friendID
            })
        });
        const data = await response.json();
        chatList.push(data);
        showChats();
        CHATDIALOG.close();
    });
}

function getChat(chatID) {
    for (let i = 0; i < chatList.length; i++) {
        if (chatList[i].ID === chatID) {
            return chatList[i];
        }
    }
    return null;
}

function closeChat() {
    const section = document.querySelector('body section');
    section.style.right = "-100%";
}