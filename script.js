let currentPage = 1;
let currentQuery = '';

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    currentPage = 1; // Reset to first page
    let query = document.getElementById('search-input').value;
    if (query.trim() === '') return;

    currentQuery = query;
    saveToHistory(query);
    fetchResults(query, currentPage);
});

document.getElementById('clear-button').addEventListener('click', function() {
    document.getElementById('search-input').value = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('history-list').innerHTML = '';
    currentPage = 1;
    currentQuery = '';
    updatePaginationButtons();
});

document.getElementById('prev-page').addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        fetchResults(currentQuery, currentPage);
    }
});

document.getElementById('next-page').addEventListener('click', function() {
    currentPage++;
    fetchResults(currentQuery, currentPage);
});

document.getElementById('voice-button').addEventListener('click', function() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.onresult = function(event) {
        let query = event.results[0][0].transcript;
        document.getElementById('search-input').value = query;
        currentQuery = query;
        saveToHistory(query);
        fetchResults(query, currentPage);
    };
    recognition.start();
});

function fetchResults(query, page) {
    let offset = (page - 1) * 10; // 10 results per page
    let url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&skip=${offset}&num=10`;

    document.getElementById('spinner').style.display = 'block'; // Show spinner

    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('spinner').style.display = 'none'; // Hide spinner
            let resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = ''; // Clear previous results
            if (!data.RelatedTopics || data.RelatedTopics.length === 0) {
                resultsDiv.innerHTML = '<p>No results found.</p>';
                updatePaginationButtons();
                return;
            }
            data.RelatedTopics.forEach(item => {
                if (item.Text) {
                    let resultDiv = document.createElement('div');
                    resultDiv.className = 'result';
                    let imgSrc = item.Icon && item.Icon.URL ? `https://duckduckgo.com${item.Icon.URL}` : '';
                    let excerpt = item.Text; // Use Text as excerpt
                    resultDiv.innerHTML = `
                        ${imgSrc ? `<img src="${imgSrc}" alt="Result image">` : ''}
                        <a href="${item.FirstURL}" target="_blank">${item.Text}</a>
                        <p class="excerpt">${excerpt}</p>
                    `;
                    resultsDiv.appendChild(resultDiv);
                }
            });
            updatePaginationButtons();
        })
        .catch(error => {
            document.getElementById('spinner').style.display = 'none'; // Hide spinner
            console.error('Error fetching the search results:', error);
            let resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `<p>Error fetching the search results: ${error.message}</p>`;
        });
}

function saveToHistory(query) {
    let historyList = document.getElementById('history-list');
    let historyItem = document.createElement('li');
    historyItem.className = 'list-group-item';
    historyItem.textContent = query;
    historyItem.addEventListener('click', function() {
        document.getElementById('search-input').value = query;
        currentQuery = query;
        currentPage = 1;
        fetchResults(query, currentPage);
    });
    historyList.appendChild(historyItem);
}

function updatePaginationButtons() {
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentQuery.trim() === '';
}
