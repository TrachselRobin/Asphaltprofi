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

    const loginForm = document.getElementById('loginForm');
    const submitButton = document.getElementById('loginButton');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorEmail = document.getElementById('errorEmail');
    const errorPassword = document.getElementById('errorPassword');

    emailInput.addEventListener('input', () => {
        if (emailInput.value.length > 0) {
            errorEmail.style.display = 'none';
        } else {
            errorEmail.style.display = 'block';
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length > 0) {
            errorPassword.style.display = 'none';
        } else {
            errorPassword.style.display = 'block';
        }
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (emailInput.value.length === 0) {
            errorEmail.style.display = 'block';
        }

        if (passwordInput.value.length === 0) {
            errorPassword.style.display = 'block';
        }

        if (emailInput.value.length > 0 && passwordInput.value.length > 0) {
            submitButton.disabled = true;
            submitButton.style.cursor = 'not-allowed';
            submitButton.style.backgroundColor = '#ccc';
            fetch('http://localhost:3000/login', {
                method: "POST",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: "hans@muster.ch",
                  password: "1234"
                })
            }).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });
        }
    });
});