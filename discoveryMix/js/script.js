let clientId = await getClientId()
const accessToken = await logIn(clientId);
const waitTimeBeforeSearch = 1000
const userId = await getUserId(accessToken)
var lastChangeTime = 0
var lastQuery = ""

var seed = {"artists":[],"userInput":""}

// ARTIST

const inputFieldArtist = document.getElementById('artist-input');
const dropdownArtist = document.getElementById('artist-results');
const seedPreview = document.getElementById('seed-preview')
let artists = []
var genresSet = new Set([])

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
    if (seed.artists.length>=5){
        alert("You can't add anything")
        return
    }
    seed["artists"].push(artists[index])
    console.log(artists[index].genres)
    updateSearchedArtist(false)
    updateSeedPreview()
    addGenres(artists[index])
    updateGenres()
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

async function fetchSearchedTrack(query) {
    const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURI(query)}&type=track`, {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });
    return await result.json()
}

async function fetchNextTracks(url) {
    do{
        await sleep(1000)
        var result = await fetch(url, {
            method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
        });
    } while (!result.ok)

    return await result.json()
}

function updateSeedPreview(){
    seedPreview.innerHTML = ""
    
    for (let i=0; i<seed.artists.length; i++){
        const element = document.createElement('div')
        const imgContainer = document.createElement('div')
        imgContainer.classList.add("image-placeholder")

        const img = document.createElement('img')
        img.src = seed.artists[i].images.length>0?seed.artists[i].images[1].url:""
        img.classList.add("icon")
        imgContainer.appendChild(img)
        element.appendChild(imgContainer)
        
        let artistName = document.createElement('p')
        artistName.innerHTML = seed.artists[i].name
        element.appendChild(artistName)

        // Bottone "X" per rimuovere l'artista
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add("x")
        removeButton.classList.add("ximage")
        removeButton.style.position = 'absolute'
        removeButton.onclick = () => {
            removeGenres(seed["artists"][i])
            seed["artists"].splice(i, 1)
            updateSeedPreview()
            updateGenres()
        }
        imgContainer.appendChild(removeButton);

        seedPreview.appendChild(element)
    }
}

function addGenres(artist){
    artist.genres.forEach(genresSet.add, genresSet)
}

function removeGenres(artist){
    artist.genres.forEach(genresSet.delete, genresSet) 
}

function updateGenres(){
    const genresDiv = document.getElementById("selectedGenres")
    genresDiv.innerHTML = ""

    genresSet.forEach(genre => {
        const genreBox = document.createElement('div')
        genreBox.classList.add("genreBox")
        const genreText = document.createElement('div')
        genreText.innerHTML = genre
        genreBox.append(genreText)

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.classList.add("x")
        removeButton.addEventListener("click",function(){
            genresSet.delete(genre)
            updateGenres()
        })
        genreBox.append(removeButton)

        genresDiv.append(genreBox)
    })

}

async function isGenreConsistent(genres, artistID){
    let result = await fetch(`https://api.spotify.com/v1/artists/${artistID}`, {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    let artist = await result.json()

    let valid = false
    artist.genres.forEach(genre => {
        if (genres.includes(genre)){
            valid = true
        }    
    });
    return valid
}

async function findPlaylist(name){
    let res = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    let data = await res.json();

    let playlistId = ""
    data.items.forEach(playlist => {
        if (playlist.name == name) {
            playlistId = playlist.id
        }
    })
    return playlistId
}

async function addTracksToPlaylist(playlistId, trackUris, accessToken) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const body = { uris: trackUris };

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    return data;
}

var query = ""
var tracks = []

async function playlist(){
    query = seed.userInput
    tracks= []

    let genres = Array.from(genresSet)
    console.log(genres)

    query += "%2520genre:(" + genres.join(" OR ").toString() + ")"
    console.log(query)

    if (query == "") return 
    var result = await fetchSearchedTrack(query)

    result.tracks.items.forEach(async item => {
        if (await isGenreConsistent(genres, item.artists[0].id)){
            tracks.push(item)
        }
    }) 

    var output = ""

    let nextTracks = result.tracks.next

    let rounds = 10
    document.getElementById("countdown").innerText = rounds

    for (var i=0; i<rounds; i++){
        console.log("session " + i)
        var next = await fetchNextTracks(nextTracks)
        
        next.tracks.items.forEach(async item => {
            await sleep(25)
            if (await isGenreConsistent(genres, item.artists[0].id)){
                tracks.push(item)
                output += item.name + " - " + item.artists[0].name + "\n"
            }
        })
        nextTracks = next.tracks.next
        document.getElementById("countdown").innerText = rounds - i - 1
    }

    var preview = document.getElementById("preview")
    preview.innerText = query + "\n" + output
}

async function savePlaylist(){
    if (tracks.length == 0) return
    
    let playlistId = await findPlaylist(query)
    if (playlistId == ""){
        playlistId = await createPlaylist(query, userId, accessToken, `Playlist creata con ${query}`)
    }
    
    let urisToAdd = []

    tracks.forEach(track => {
        urisToAdd.push(`spotify:track:${track.id}`)
    });

    for (let i=0; i<urisToAdd.length;i+=50){
        let uris = urisToAdd.slice(i,i+50)
        addTracksToPlaylist(playlistId, uris , accessToken)
    }

    var preview = document.getElementById("preview")
    preview.innerText = "Done!"
}

const searchButton = document.getElementById('searchButton')
searchButton.addEventListener("click", playlist)
const saveButton = document.getElementById('saveButton')
saveButton.addEventListener("click", savePlaylist)

const userInput = document.getElementById('user-input')
userInput.addEventListener("change", function(){
    seed.userInput = userInput.value
})
