document.addEventListener('DOMContentLoaded', function() {
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
    
    const firstForm = document.getElementById('firstForm');
    const secondForm = document.getElementById('secondForm');
    const thirdForm = document.getElementById('thirdForm');

    const error = document.getElementsByClassName('error');

    const cancleButtons = document.getElementsByClassName('cancleModal');

    for (let i = 0; i < cancleButtons.length; i++) {
        cancleButtons[i].addEventListener('click', function() {
            window.location.href = './index.html';
        });
    }

    firstForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let user = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
        };

        if (user.password !== user.confirmPassword) {
            error[0].style.display = 'block';
            error[0].innerText = 'Passwörter stimmen nicht überein!';
            return;
        }
        firstForm.style.display = 'none';
        secondForm.style.display = 'flex';
    });

    secondForm.addEventListener('submit', function(event) {
        event.preventDefault();
        secondForm.style.display = 'none';
        thirdForm.style.display = 'flex';
    });

    thirdForm.addEventListener('submit', function(event) {
        event.preventDefault();
        window.location.href = './index.html';
    });
});