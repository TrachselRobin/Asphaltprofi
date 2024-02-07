document.addEventListener('DOMContentLoaded', function () {
    const CAROUSEL = document.getElementById('carousel');
    const CAROUSEL_CHILDREN = CAROUSEL.children.length;
    
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
});