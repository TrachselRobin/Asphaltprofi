document.addEventListener('DOMContentLoaded', function() {
    // add class "hidden" to every every element with class "logedIn"
    // verify if the user is loged in
    // if the user is loged in, remove the class "hidden" from every element with class "logedIn"
    // if the user is not loged in, remove the class "hidden" from every element with class "notLogedIn"
    
    const logedInElements = document.querySelectorAll('.logedIn');
    logedInElements.forEach((element) => {
        element.classList.add('hidden');
    });

    const notLogedInElements = document.querySelectorAll('.notLogedIn');
    notLogedInElements.forEach((element) => {
        element.classList.remove('hidden');
    });

    verify().then((result) => {
        console.log(result);
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
    const data = await response.text();
    console.log(data);
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
    const data = await response.text();
    console.log(data);
    if (response.status === 200) {
        localStorage.removeItem('token');
        window.location.reload();
    }
}
