document.addEventListener('DOMContentLoaded', function() {
    // give every svg element a random direction. if they touch the border on the side, change the x direction, if they touch the border on the top or bottom, change the y direction
    // give every svg element a random speed
    // move every svg element in the direction and speed

    const svgElements = document.querySelectorAll('svg');
    let svgElementsData = [];
    svgElements.forEach((svgElement) => {
        const svgElementData = {
            svgElement: svgElement,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            xDirection: Math.random() > 0.5 ? 1 : -1,
            yDirection: Math.random() > 0.5 ? 1 : -1,
            speed: Math.random() * 5,
        };
        svgElementsData.push(svgElementData);
    });

    setInterval(() => {
        svgElementsData.forEach((svgElementData) => {
            svgElementData.x += svgElementData.xDirection * svgElementData.speed;
            svgElementData.y += svgElementData.yDirection * svgElementData.speed;
            svgElementData.svgElement.style.transform = `translate(${svgElementData.x}px, ${svgElementData.y}px)`;
            if (svgElementData.x < 0 || svgElementData.x > window.innerWidth) {
                svgElementData.xDirection *= -1;
            }
            if (svgElementData.y < 0 || svgElementData.y > window.innerHeight) {
                svgElementData.yDirection *= -1;
            }
        });
    }, 1000 / 60);

    const LOGINFORM = document.getElementById('loginForm');
    const SUBMITBUTTON = document.getElementById('loginButton');
    const EMAILINPUT = document.getElementById('email');
    const PASSWORDINPUT = document.getElementById('password');
    const ERROREMAIL = document.getElementById('errorEmail');
    const ERRORPASSWORD = document.getElementById('errorPassword');

    EMAILINPUT.addEventListener('input', () => {
        if (EMAILINPUT.value.length > 0) {
            ERROREMAIL.style.display = 'none';
        } else {
            ERROREMAIL.style.display = 'block';
        }
    });

    PASSWORDINPUT.addEventListener('input', () => {
        if (PASSWORDINPUT.value.length > 0) {
            ERRORPASSWORD.style.display = 'none';
        } else {
            ERRORPASSWORD.style.display = 'block';
        }
    });

    LOGINFORM.addEventListener('submit', (event) => {
        event.preventDefault();

        if (EMAILINPUT.value.length === 0) {
            ERROREMAIL.style.display = 'block';
        }

        if (PASSWORDINPUT.value.length === 0) {
            ERRORPASSWORD.style.display = 'block';
        }

        if (EMAILINPUT.value.length > 0 && PASSWORDINPUT.value.length > 0) {
            SUBMITBUTTON.disabled = true;
            SUBMITBUTTON.style.cursor = 'not-allowed';
            SUBMITBUTTON.style.backgroundColor = '#ccc';
            
            login();
        }
    });
});

async function login() {
    const EMAIL = document.getElementById('email').value;
    const PASSWORD = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email: EMAIL, 
            password: PASSWORD
        }),
    });

    const data = await response.text();
    const status = response.status;
    const SUBMITBUTTON = document.getElementById('loginButton');

    if (status === 200) {
        // data is a token. Create a token with this string and store it in the local storage
        localStorage.setItem('token', data);
        window.location.href = './index.html';
    } else if (status === 401 || status === 404) {
        const ERROR = document.getElementById('error');
        ERROR.innerText = 'E-Mail oder Passwort ist falsch!';
        ERROR.style.display = 'block';
        SUBMITBUTTON.disabled = false;
        SUBMITBUTTON.style.cursor = 'pointer';
        SUBMITBUTTON.style.backgroundColor = '#4F0147';
    } else if (status === 409) {
        const ERROR = document.getElementById('error');
        ERROR.innerText = 'Benutzer bereits angemeldet!';
        ERROR.style.display = 'block';
        SUBMITBUTTON.disabled = false;
        SUBMITBUTTON.style.cursor = 'pointer';
        SUBMITBUTTON.style.backgroundColor = '#4F0147';
    } else {
        const ERROR = document.getElementById('error');
        ERROR.innerText = 'Ein Fehler ist aufgetreten!';
        ERROR.style.display = 'block';
        SUBMITBUTTON.disabled = false;
        SUBMITBUTTON.style.cursor = 'pointer';
        SUBMITBUTTON.style.backgroundColor = '#4F0147';
    }
}