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
    
    const firstRegisterModal = document.getElementById('firstRegisterModal');
    const submitModal1 = document.getElementById('submitModal1');
    const secondRegisterModal = document.getElementById('secondRegisterModal');
    const submitModal2 = document.getElementById('submitModal2');
    const thirdRegisterModal = document.getElementById('thirdRegisterModal');
    const submitModal3 = document.getElementById('register');

    const cancleButtons = document.getElementsByClassName('cancleModal');

    for (let i = 0; i < cancleButtons.length; i++) {
        cancleButtons[i].addEventListener('click', function() {
            window.location.href = './index.html';
        });
    }

    firstRegisterModal.showModal();

    submitModal1.addEventListener('click', function() {
        submitModal1.disabled = true;
        submitModal1.classList.add('disabled');
        firstRegisterModal.close();
        secondRegisterModal.showModal();
    });

    submitModal2.addEventListener('click', function() {
        secondRegisterModal.close();
        thirdRegisterModal.showModal();
    });

    submitModal3.addEventListener('click', function() {
        thirdRegisterModal.close();
    });
});