let clientId = await getClientId()
const accessToken = await logIn(clientId);
const waitTimeBeforeSearch = 1000
var lastChangeTime = 0
var lastQuery = ""

// Track

const inputFieldTrack = document.getElementById('song-input');
const dropdownTrack = document.getElementById('song-results');

async function fetchSearchedTrack(query) {
    const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURI(query)}&type=track`, {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });
    return await result.json()
}

async function updateSearchedTrack() {
    if (Date.now() - lastChangeTime <= waitTimeBeforeSearch){
        setTimeout(updateSearchedTrack, waitTimeBeforeSearch)
        return
    }
    lastChangeTime = Date.now()

    const query = inputFieldTrack.value.toLowerCase();
    if (query == lastQuery){
        return
    }
    lastQuery = query
    
    // Clear previous results
    dropdownTrack.innerHTML = '';

    let result = await fetchSearchedTrack(query)
    console.log(result)

    let results = []
    
    for (let i=0; i<result.tracks.limit; i++){
        results.push(result.tracks.items[i].name)
    }
    console.log(results)


    if (results.length > 0 && query) {
        // Populate dropdown with filtered results
        results.forEach((song, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = song;
            dropdownTrack.appendChild(option);
        });

        // Show the dropdown if there are results
        dropdownTrack.style.display = 'block';
    } else {
        // Hide the dropdown if there are no results
        dropdownTrack.style.display = 'none';
    }
}

// Listen for input changes
inputFieldTrack.addEventListener('input', updateSearchedTrack);

// Handle selection from dropdown
dropdownTrack.addEventListener('change', function () {
    const selectedSong = this.options[this.selectedIndex].text;
    if (selectedSong !== 'No results found') {
        alert('You selected: ' + selectedSong);
        // Further logic can be added here to handle the selected song
    }
});

// ARTIST

const inputFieldArtist = document.getElementById('artist-input');
const dropdownArtist = document.getElementById('artist-results');

async function fetchSearchedArtist(query) {
    const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURI(query)}&type=artist`, {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });
    return await result.json()
}

async function updateSearchedArtist() {
    if (Date.now() - lastChangeTime <= waitTimeBeforeSearch){
        setTimeout(updateSearchedArtist, waitTimeBeforeSearch)
        return
    }
    lastChangeTime = Date.now()

    const query = inputFieldArtist.value.toLowerCase();
    if (query == lastQuery){
        return
    }
    lastQuery = query
    
    // Clear previous results
    dropdownArtist.innerHTML = '';

    let result = await fetchSearchedArtist(query)
    console.log(result)

    let results = []
    
    for (let i=0; i<result.artists.limit; i++){
        results.push(result.artists.items[i].name)
    }
    console.log(results)


    if (results.length > 0 && query) {
        // Populate dropdown with filtered results
        results.forEach((artist, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = artist;
            dropdownArtist.appendChild(option);
        });

        // Show the dropdown if there are results
        dropdownArtist.style.display = 'block';
    } else {
        // Hide the dropdown if there are no results
        dropdownArtist.style.display = 'none';
    }
}

// Listen for input changes
inputFieldArtist.addEventListener('input', updateSearchedArtist);

// Handle selection from dropdown
dropdownArtist.addEventListener('change', function () {
    const selectedArtist = this.options[this.selectedIndex].text;
    if (selectedArtist !== 'No results found') {
        alert('You selected: ' + selectedArtist);
        // Further logic can be added here to handle the selected Artist
    }
});

// GENRE

const inputFieldGenre = document.getElementById('genre-input');
const dropdownGenre = document.getElementById('genre-results');

const genres = await fetch(`https://api.spotify.com/v1/recommendations/available-genre-seeds`, {
    method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
}).then((result) => result.json().then((res) => res.genres))

function updateSearchedGenre() {
    if (Date.now() - lastChangeTime <= waitTimeBeforeSearch){
        setTimeout(updateSearchedGenre, waitTimeBeforeSearch)
        return
    }
    lastChangeTime = Date.now()

    const query = inputFieldGenre.value.toLowerCase();
    if (query == lastQuery){
        return
    }
    lastQuery = query

    // Clear previous results
    dropdownGenre.innerHTML = '';

    // Filter songs based on the query
    const filteredGenres = genres.filter(genre => 
        genre.toLowerCase().includes(query)
    );
    console.log(filteredGenres)
    
    if (filteredGenres.length > 0) {
        // Populate dropdown with filtered results
        filteredGenres.forEach((genre, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = genre;
            dropdownGenre.appendChild(option);
        });

        dropdownGenre.style.display = 'block';
    } else {
        // Show "No results found" if there are no matches
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No results found';
        dropdownGenre.appendChild(option);
        dropdownGenre.style.display = 'none';
    }
}

// Listen for input changes
inputFieldGenre.addEventListener('input', updateSearchedGenre);

// Handle selection from dropdown
dropdownGenre.addEventListener('change', function () {
    const selectedGenre = this.options[this.selectedIndex].text;
    if (selectedGenre !== 'No results found') {
        alert('You selected: ' + selectedGenre);
        // Further logic can be added here to handle the selected Genre
    }
});
