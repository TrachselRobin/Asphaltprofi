document.addEventListener('DOMContentLoaded', function() {
    const SEARCHINPUT = document.getElementById('search');

    loadUsers('');

    SEARCHINPUT.addEventListener('keyup', function() {
        loadUsers(SEARCHINPUT.value);
    });
});

async function loadUsers(string) {
    const USERLIST = document.getElementById('userList');
    const RESPONSE = await fetch(`http://localhost:3000/users/${string}`);
    const DATA = await RESPONSE.json();

    console.log(DATA);

    USERLIST.innerHTML = '';

    DATA.forEach(user => {
        const USER = createUserElement(user);
    });
}

async function createUserElement(user) {
    const USER = document.createElement('li');
    USER.classList.add('user');

    const IMAGE = document.createElement('img');
    const RESPONSE = await fetch(`http://localhost:3000/image/${user.image}`);
    const DATA = await RESPONSE.blob();
    IMAGE.src = URL.createObjectURL(DATA);
    IMAGE.alt = 'user';
    IMAGE.classList.add('profilbild');

    const USERNAME = document.createElement('p');
    USERNAME.classList.add('username');
    USERNAME.textContent = `@${user.username}`;

    const NAME = document.createElement('p');
    NAME.classList.add('name');
    NAME.textContent = user.name + ' ' + user.prename;

    USER.appendChild(IMAGE);
    USER.appendChild(USERNAME);
    USER.appendChild(NAME);

    const USERLIST = document.getElementById('userList');
    USERLIST.appendChild(USER);
}