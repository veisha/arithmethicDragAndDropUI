let allData = []; // Stores all fetched leaderboard data
let currentPage = 1;
const resultsPerPage = 10;
let selectedType = []; // Stores selected game types (toggle buttons)
let sortBy = ''; // Keeps track of the selected sorting method

// Fetches leaderboard data once and stores it locally
async function fetchLeaderboardData() {
    const response = await fetch('http://localhost:3000/leaderboard');
    allData = await response.json();
    filterLeaderboard();
}

// Filters leaderboard based on user inputs
function filterLeaderboard() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value.toLowerCase();
    const type = document.querySelector('input[name="type"]:checked').value.toLowerCase();
    const username = document.getElementById('username-search').value.trim().toLowerCase();
    sortBy = document.querySelector('input[name="sort"]:checked')?.value || ''; // Default to empty if none selected

    let filteredData = allData;

    // Apply filters
    if (difficulty) filteredData = filteredData.filter(entry => entry.difficulty === difficulty);
    if (type) filteredData = filteredData.filter(entry => entry.type === type);
    if (username) filteredData = filteredData.filter(entry => entry.username.toLowerCase().includes(username));

    // Apply sorting
    if (sortBy === 'score') filteredData.sort((a, b) => b.score - a.score);
    if (sortBy === 'time') filteredData.sort((a, b) => a.formatted_time.localeCompare(b.formatted_time));

    displayLeaderboard(filteredData);
}


// Displays leaderboard with pagination
function displayLeaderboard(data) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';

    // Paginate results
    const start = (currentPage - 1) * resultsPerPage;
    const paginatedData = data.slice(start, start + resultsPerPage);

    paginatedData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.username}</td>
            <td>${entry.difficulty}</td>
            <td>${entry.type}</td>
            <td>${entry.score}</td>
            <td>${entry.formatted_time}</td>
        `;
        leaderboardBody.appendChild(row);
    });

    updatePaginationControls(data.length);
}

// Handles pagination
function changePage(direction) {
    currentPage += direction;
    filterLeaderboard();
}

// Updates pagination buttons
function updatePaginationControls(totalResults) {
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage * resultsPerPage >= totalResults;
    document.getElementById('pageInfo').textContent = `Page ${currentPage}`;
}

// Handles sorting
function sortLeaderboard(criteria) {
    sortBy = criteria;
    filterLeaderboard();
}

// Handles toggle buttons for game type
function toggleTypeFilter(type) {
    const index = selectedType.indexOf(type);
    if (index > -1) {
        selectedType.splice(index, 1); // Remove if already selected
    } else {
        selectedType.push(type); // Add if not selected
    }
    filterLeaderboard();
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', fetchLeaderboardData);

function toggleFilters() {
    const filterContainer = document.getElementById("filter-container");
    filterContainer.style.display = (filterContainer.style.display === "none" || filterContainer.style.display === "") ? "block" : "none";
}
