document.addEventListener('DOMContentLoaded', () => {
    const LOADER = document.getElementById('loader');
    LOADER.classList.remove('hidden');
    fetch('http://localhost:3000/leaderboard')
        .then(response => response.json())
        .then(data => {
            LOADER.classList.add('hidden');
            const leaderboard = document.getElementById('leaderboard');
            data.forEach((element, index) => {
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