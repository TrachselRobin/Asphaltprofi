document.addEventListener('DOMContentLoaded', function () {
    const NAVBAR = document.getElementsByTagName('nav')[0];

    window.addEventListener('scroll', function () {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > 100) {
            if (NAVBAR.classList.contains('light')) {
                NAVBAR.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            } else {
                NAVBAR.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            }
        } else {
            NAVBAR.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        }
    }, false);

    document.addEventListener('click', function (event) {
        const BURGERLIST = document.getElementById('burgerList');
        if (BURGERLIST.classList.contains('burgerLeft') && event.target.id !== "burgerList" && event.target.id !== "burgerLi") {
            toggleMenu();
        }
    });
});

function toggleMenu() {
    const BURGERLIST = document.getElementById('burgerList');
    BURGERLIST.classList.toggle('burgerLeft');
    if (BURGERLIST.classList.contains('burgerLeft')) {
        BURGERLIST.style.left = '0';
    } else {
        BURGERLIST.style.left = '100vw';
    }
}