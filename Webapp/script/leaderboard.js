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
                    "user": {
                        "ID": 1000000001,
                        "username": "hansi"
                    },
                    "time": {
                        "ID": 14,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:49:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000001,
                        "username": "hansi"
                    },
                    "time": {
                        "ID": 13,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:50:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000001,
                        "username": "hansi"
                    },
                    "time": {
                        "ID": 12,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:51:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000001,
                        "username": "hansi"
                    },
                    "time": {
                        "ID": 10,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:52:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "time": {
                        "ID": 9,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:53:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000001,
                        "username": "hansi"
                    },
                    "time": {
                        "ID": 11,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:53:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "time": {
                        "ID": 8,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:54:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "time": {
                        "ID": 7,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:55:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "time": {
                        "ID": 6,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:56:00.000Z"
                    }
                },
                {
                    "user": {
                        "ID": 1000000000,
                        "username": "maxi"
                    },
                    "time": {
                        "ID": 5,
                        "start": "2021-05-01T10:00:00.000Z",
                        "end": "2021-05-01T10:57:00.000Z"
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
                rank.textContent = index + 1;
                row.appendChild(rank);
                const username = document.createElement('td');
                username.textContent = element.user.username;
                row.appendChild(username);
                const time = document.createElement('td');
                time.textContent = (new Date(element.time.end) - new Date(element.time.start)) / 1000 + 's';
                row.appendChild(time);
                leaderboard.appendChild(row);
            });
        });
});