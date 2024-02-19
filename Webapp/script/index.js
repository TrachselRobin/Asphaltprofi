document.addEventListener('DOMContentLoaded', function() {
    const SEARCH = document.getElementById('search');
    const LEADERBOARD = document.getElementById('leaderboard');
    const CHAT = document.getElementById('chat');
    const PROFILE = document.getElementById('profile');
    const IFRAME = document.getElementById('iframe');

    SEARCH.addEventListener('click', function() {
        IFRAME.src = './search.html';
        verify().then((result) => {
            if (result) {
                logedInElements.forEach((element) => {
                    element.classList.remove('hidden');
                });
                notLogedInElements.forEach((element) => {
                    element.classList.add('hidden');
                });
            }
        });
    });

    LEADERBOARD.addEventListener('click', function() {
        IFRAME.src = './leaderboard.html';
    });

    CHAT.addEventListener('click', function() {
        IFRAME.src = './chat.html';
        verify().then((result) => {
            if (result) {
                logedInElements.forEach((element) => {
                    element.classList.remove('hidden');
                });
                notLogedInElements.forEach((element) => {
                    element.classList.add('hidden');
                });
            }
        });
    });

    PROFILE.addEventListener('click', function() {
        IFRAME.src = './profile.html';
        verify().then((result) => {
            if (result) {
                logedInElements.forEach((element) => {
                    element.classList.remove('hidden');
                });
                notLogedInElements.forEach((element) => {
                    element.classList.add('hidden');
                });
            }
        });
    });
    
    const logedInElements = document.querySelectorAll('.logedIn');
    logedInElements.forEach((element) => {
        element.classList.add('hidden');
    });

    const notLogedInElements = document.querySelectorAll('.notLogedIn');
    notLogedInElements.forEach((element) => {
        element.classList.remove('hidden');
    });

    verify().then((result) => {
        if (result) {
            logedInElements.forEach((element) => {
                element.classList.remove('hidden');
            });
            notLogedInElements.forEach((element) => {
                element.classList.add('hidden');
            });
        }
    });
});

async function verify() {
    const response = await fetch(`http://localhost:3000/verify/${localStorage.getItem('token')}`);
    if (response.status === 200) {
        return true;
    } else {
        return false;
    }
}

async function logout() {
    const response = await fetch(`http://localhost:3000/logout`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: localStorage.getItem('token') })
    });
    if (response.status === 200) {
        localStorage.removeItem('token');
        window.location.reload();
    }
}
