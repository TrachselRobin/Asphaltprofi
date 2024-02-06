document.addEventListener('DOMContentLoaded', function () {
    const CAROUSEL = document.getElementById('carousel');
    const CAROUSEL_CHILDREN = CAROUSEL.children.length;

    const NAVBAR = document.getElementsByTagName('nav')[0];

    /*
        Create a new keyframes animation for the carousel that depends on the number of children.
        For two children, the animation should look like this:
        @keyframes carousel {
            0% { right: 0vw; }
            45% { right: 0vw; }
            50% { right: 100vw; }
            95% { right: 100vw; }
            100% { right: 0vw; }
        }
        For three children, the animation should look like this:
        @keyframes carousel {
            0% { right: 0vw; }
            30% { right: 0vw; }
            33.33% { right: 100vw; }
            63.33% { right: 100vw; }
            66.66% { right: 200vw; }
            96.66% { right: 200vw; }
            100% { right: 0vw; }
        }
    */
    let keyframes = `@keyframes carousel {\n\t0% { transform: translateX(0vw); }`;
    for (let i = 0; i < CAROUSEL_CHILDREN; i++) {
        keyframes += `\n\t${(i+1) * 90 / CAROUSEL_CHILDREN + (10 / CAROUSEL_CHILDREN) * i}% { transform: translateX(-${(i) * 100}vw); }`;
        if (i >= CAROUSEL_CHILDREN - 1) {
            keyframes += `\n\t100% { transform: translateX(0vw); }`;
        } else {
            keyframes += `\n\t${(i+1) * 90 / CAROUSEL_CHILDREN + (10 / CAROUSEL_CHILDREN) * i + 10 / CAROUSEL_CHILDREN}% { transform: translateX(-${(i+1) * 100}vw); }`;
        }
    }
    keyframes += `\n}`;

    const STYLE = document.createElement('style');
    STYLE.innerHTML = keyframes;
    document.head.appendChild(STYLE);

    CAROUSEL.style.animation = `carousel ${5 * CAROUSEL_CHILDREN}s infinite`;

    window.addEventListener('scroll', function () {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > 100) {
            NAVBAR.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
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