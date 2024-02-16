document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/leaderboard')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const leaderboard = document.getElementById('leaderboard');
            /* 
            data =
            [
               {
                    "ID": 2,
                    "start": "2024-02-16T13:56:59.000Z",
                    "end": "2024-02-16T13:57:04.000Z",
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "vehicle": {
                        "ID": 1,
                        "brand": "BMW",
                        "model": "M3",
                        "image": "./images/bmw.png",
                        "year": 2019,
                        "hp": 431,
                        "ccm": 2979,
                        "tagID": 1
                    }
                },
                {
                    "ID": 3,
                    "start": "2024-02-16T13:56:59.000Z",
                    "end": "2024-02-16T13:57:05.000Z",
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "vehicle": {
                        "ID": 3,
                        "brand": "Audi",
                        "model": "A4",
                        "image": "images/audi-a4.jpg",
                        "year": 2019,
                        "hp": 150,
                        "ccm": 2000,
                        "tagID": 1
                    }
                },
                {
                    "ID": 4,
                    "start": "2024-02-16T13:56:59.000Z",
                    "end": "2024-02-16T13:57:05.000Z",
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "vehicle": {
                        "ID": 3,
                        "brand": "Audi",
                        "model": "A4",
                        "image": "images/audi-a4.jpg",
                        "year": 2019,
                        "hp": 150,
                        "ccm": 2000,
                        "tagID": 1
                    }
                }
            ]
            */
            data.forEach((element, index) => {
                /*
                HTML structure:
                <table id="leaderboard">
                    <th>
                        <td>Rang</td>
                        <td>Benutzername</td>
                        <td>Startzeit</td>
                        <td>Endzeit</td>
                        <td>Zeit</td>
                    </th>
                </table>
                */
                const row = document.createElement('tr');
                const rank = document.createElement('td');
                const username = document.createElement('td');
                const car = document.createElement('td');
                const time = document.createElement('td');
                rank.textContent = index + 1;
                username.textContent = element.user.username;
                car.textContent = `${element.vehicle.brand} ${element.vehicle.model}`;
                time.textContent = (new Date(element.end) - new Date(element.start)) / 1000;
                row.appendChild(rank);
                row.appendChild(username);
                row.appendChild(car);
                row.appendChild(time);
                leaderboard.appendChild(row);
            });
        });
});