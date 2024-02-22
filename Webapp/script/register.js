document.addEventListener('DOMContentLoaded', function () {
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
    const firstFormEmail = document.getElementById('email');
    const firstFormPassword = document.getElementById('password');
    const firstFormConfirmPassword = document.getElementById('confirmPassword');
    const firstFormSubmit = document.getElementById('submitForm1');
    const secondForm = document.getElementById('secondForm');
    const thirdForm = document.getElementById('thirdForm');
    const fourthForm = document.getElementById('fourthForm');
    const username = document.getElementById('username');

    const error = document.getElementsByClassName('error');

    const cancleButtons = document.getElementsByClassName('cancleModal');

    let USER = {};

    for (let i = 0; i < cancleButtons.length; i++) {
        cancleButtons[i].addEventListener('click', function () {
            window.location.href = './index.html';
        });
    }

    firstForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const user = {
            email: firstFormEmail.value,
            password: firstFormPassword.value,
            confirmPassword: firstFormConfirmPassword.value
        };

        if (user.password !== user.confirmPassword) {
            error[0].style.display = 'block';
            error[0].innerText = 'Passwörter stimmen nicht überein!';
            return;
        }

        let password = firstFormPassword.value;

        USER = {
            email: firstFormEmail.value,
            password: password,
        };

        firstForm.style.display = 'none';
        secondForm.style.display = 'flex';
    });

    firstFormEmail.addEventListener('blur', async function () {
        let response = await fetch(`http://localhost:3000/check/email/${firstFormEmail.value}`);
        if (response.status !== 200) {
            error[0].style.display = 'block';
            error[0].innerText = 'Email bereits vergeben!';
            firstFormSubmit.disabled = true;
            firstFormSubmit.style.backgroundColor = 'grey';
            firstFormSubmit.style.cursor = 'not-allowed';
            email.style.border = '1px solid red';
        } else {
            error[0].style.display = 'none';
            error[0].innerText = '';
            firstFormSubmit.disabled = false;
            firstFormSubmit.style.backgroundColor = '#007808';
            firstFormSubmit.style.cursor = 'pointer';
            email.style.border = 'none';
        }
    });

    firstFormPassword.addEventListener('blur', function () {
        if (firstFormConfirmPassword.value === '') return;
        if (firstFormPassword.value !== firstFormConfirmPassword.value) {
            error[0].style.display = 'block';
            error[0].innerText = 'Passwörter stimmen nicht überein!';
            firstFormPassword.style.border = '1px solid red';
            firstFormConfirmPassword.style.border = '1px solid red';
        } else {
            error[0].style.display = 'none';
            error[0].innerText = '';
            firstFormPassword.style.border = 'none';
            firstFormConfirmPassword.style.border = 'none';
        }
    });

    firstFormConfirmPassword.addEventListener('blur', function () {
        if (firstFormPassword.value !== firstFormConfirmPassword.value) {
            error[0].style.display = 'block';
            error[0].innerText = 'Passwörter stimmen nicht überein!';
            firstFormPassword.style.border = '1px solid red';
            firstFormConfirmPassword.style.border = '1px solid red';
        } else {
            error[0].style.display = 'none';
            error[0].innerText = '';
            firstFormPassword.style.border = 'none';
            firstFormConfirmPassword.style.border = 'none';
        }
    });

    secondForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const firstName = document.getElementById('firstname');
        const name = document.getElementById('lastname');
        const birthdate = document.getElementById('birthdate');

        USER = {
            ...USER,
            prename: firstName.value,
            name: name.value,
            birthdate: birthdate.value
        };

        secondForm.style.display = 'none';
        thirdForm.style.display = 'flex';
    });

    thirdForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const street = document.getElementById('street');
        const houseNumber = document.getElementById('housenumber');
        const postalCode = document.getElementById('postcode');
        const city = document.getElementById('city');

        USER = {
            ...USER,
            street: street.value,
            number: houseNumber.value,
            zip: postalCode.value,
            city: city.value
        };

        thirdForm.style.display = 'none';
        fourthForm.style.display = 'flex';
    });

    username.addEventListener('blur', async function () {
        let response = await fetch(`http://localhost:3000/check/username/${username.value}`);
        if (response.status !== 200) {
            error[0].style.display = 'block';
            error[0].innerText = 'Benutzername bereits vergeben!';
            username.style.border = '1px solid red';
        } else {
            error[0].style.display = 'none';
            error[0].innerText = '';
            username.style.border = 'none';
        }
    });

    fourthForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username');
        const profileImage = document.getElementById('profilePicture');

        // store image in const. change name of image to date and time + "-" + username
        let image = profileImage.files[0];
        let date = Date.now();
        let ending = image.name.substring(image.name.lastIndexOf('.'), image.name.length);
        let imageName = username.value + ending;
        const formData = new FormData();
        formData.append('image', image, imageName);

        USER = {
            ...USER,
            username: username.value,
            image: date + "_" + imageName
        };

        console.log(USER);

        createUser(USER, formData);
    });
});

async function createUser(USER, formData) {
    await registerUser(USER);
    upload(formData);
}

async function upload(formData) {
    console.log("upload");
    let response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        header: {
            'content-type': 'application/json',
        },
        body: formData,
    })

    window.location.href = './index.html';
}

async function registerUser(USER) {
    console.log("register");
    let response = await fetch('http://localhost:3000/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(USER),
    });

    let data = await response.text();
    sessionStorage.setItem('token', data);
}