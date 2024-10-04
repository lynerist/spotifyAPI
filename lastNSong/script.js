let clientId = await getClientId()
const accessToken = await logIn(clientId);

async function fetchRecentlyPlayed(token, numberSongs) {
    numberSongs = numberSongs>50?50:numberSongs
    numberSongs = numberSongs<1?1:numberSongs
    const result = await fetch(`https://api.spotify.com/v1/me/player/recently-played`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function logNSongs(){
    clearConsole()
    let numberSongs = document.getElementById("songsNumber").value
    let songs = await fetchRecentlyPlayed(accessToken, numberSongs)
    songs = songs.items
    
    for (let i = 0; i<numberSongs; i++){
        console.log(songs[i].track.name + " - " + songs[i].track.artists[0].name)
    }
}

document.getElementById("songsNumber").addEventListener("change", logNSongs)
logNSongs()