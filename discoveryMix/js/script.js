let clientId = await getClientId()
const accessToken = await logIn(clientId);
const waitTimeBeforeSearch = 1000
var lastChangeTime = 0
var lastQuery = ""

var seed = {"artists":[],"tracks":[],"genres":[]}

// ARTIST

const inputFieldArtist = document.getElementById('artist-input');
const dropdownArtist = document.getElementById('artist-results');
let artists = []

async function fetchSearchedArtist(query) {
    const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURI(query)}&type=artist`, {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });
    return await result.json()
}

function updateImage(src){
    document.getElementById("image-placeholder").src = src
}

async function updateSearchedArtist(controls=true) {
    const query = inputFieldArtist.value.toLowerCase();
    if (controls){
        if (Date.now() - lastChangeTime < waitTimeBeforeSearch){
            setTimeout(updateSearchedArtist, waitTimeBeforeSearch)
            return
        }
        lastChangeTime = Date.now()
        
        if (query == lastQuery){
            return
        }
        lastQuery = query
    }
    
    // Clear previous results
    dropdownArtist.innerHTML = '';
    if (query == ""){
        dropdownArtist.style.display = 'none';
        return
    }

    let result = await fetchSearchedArtist(query)
    artists = result.artists.items.filter(artist => 
        seed["artists"].filter(t => t["id"] === artist["id"]).length==0
    );
    
    for (let i=0; i<artists.length; i++){
        const option = document.createElement('option');
        option.value = i;
        option.textContent += artists[i].name;
            
        option.onmouseover = (func  => updateImage(artists[i].images[1].url))
        dropdownArtist.appendChild(option);
    }  
    dropdownArtist.style.display = 'block';
}

function addArtist(index){
    if (seed.artists.length+seed.tracks.length+seed.genres.length>=5){
        alert("You can't add anything")
        return
    }
    seed["artists"].push(artists[index])
    console.log(seed)
    updateSearchedArtist(false)
}

// Listen for input changes
inputFieldArtist.addEventListener('input', updateSearchedArtist);

// Handle selection from dropdown
dropdownArtist.addEventListener('change', function () {
    const selectedArtist = this.options[this.selectedIndex].text;
    if (selectedArtist !== 'No results found') {
        addArtist(this.selectedIndex)
    }
});

// Track

const inputFieldTrack = document.getElementById('song-input');
const dropdownTrack = document.getElementById('song-results');
let tracks = []

async function fetchSearchedTrack(query) {
    const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURI(query)}&type=track`, {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });
    return await result.json()
}

async function updateSearchedTrack(controls = true) {
    const query = inputFieldTrack.value.toLowerCase();
    if (controls){
        if (Date.now() - lastChangeTime <= waitTimeBeforeSearch){
            setTimeout(updateSearchedTrack, waitTimeBeforeSearch)
            return
        }
        lastChangeTime = Date.now()
        
        if (query == lastQuery){
            return
        }
        lastQuery = query
    }
    
    // Clear previous results
    dropdownTrack.innerHTML = '';

    let result = await fetchSearchedTrack(query)
    tracks = result.tracks.items.filter(track => 
        seed["tracks"].filter(t => t["id"] === track["id"]).length==0
    );

    for (let i=0; i<tracks.length; i++){
        const option = document.createElement('option');
        option.value = i;
        option.textContent += tracks[i].name;
            
        option.onmouseover = (func  => updateImage(tracks[i].album.images[1].url))
        dropdownTrack.appendChild(option);
    }  
    dropdownTrack.style.display = 'block';
}

function addTrack(index){
    if (seed.artists.length+seed.tracks.length+seed.genres.length>=5){
        alert("You can't add anything")
        return
    }
    seed["tracks"].push(tracks[index])
    console.log(seed)
    updateSearchedTrack(false)
}

// Listen for input changes
inputFieldTrack.addEventListener('input', updateSearchedTrack);

// Handle selection from dropdown
dropdownTrack.addEventListener('change', function () {
    const selectedTrack = this.options[this.selectedIndex].text;
    if (selectedTrack !== 'No results found') {
        addTrack(this.selectedIndex)
    }
});

// GENRE

const inputFieldGenre = document.getElementById('genre-input');
const dropdownGenre = document.getElementById('genre-results');
var filteredGenres = []

const genres = await fetch(`https://api.spotify.com/v1/recommendations/available-genre-seeds`, {
    method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
}).then((result) => result.json().then((res) => res.genres))

function updateSearchedGenre(controls=true) {
    const query = inputFieldGenre.value.toLowerCase();
    
    if (controls){
        if (Date.now() - lastChangeTime <= waitTimeBeforeSearch){
            setTimeout(updateSearchedGenre, waitTimeBeforeSearch)
            return
        }
        lastChangeTime = Date.now()
    
        if (query == lastQuery){
            return
        }
        lastQuery = query
    }

    // Clear previous results
    dropdownGenre.innerHTML = '';

    // Filter songs based on the query && remove selected genres
    filteredGenres = genres.filter(genre => 
        genre.toLowerCase().includes(query) && ! seed["genres"].includes(genre)
    );
    
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
        addGenre(this.selectedIndex)
    }
});

function addGenre(index){
    if (seed.artists.length+seed.tracks.length+seed.genres.length>=5){
        alert("You can't add anything")
        return
    }
    seed["genres"].push(filteredGenres[index])
    console.log(seed)
    updateSearchedGenre(false)
}