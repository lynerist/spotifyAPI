let clientId = await getClientId()
const accessToken = await logIn(clientId);

document.getElementById("songsNumber").addEventListener("change", updateSongsBlock)

//await updateSongsBlock()
//logNSongs(accessToken)

async function fetchRecentlyPlayed(token, numberSongs) {
    numberSongs = numberSongs>50?50:numberSongs
    numberSongs = numberSongs<1?1:numberSongs
    const result = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${numberSongs}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function getPlaybacks(){
    let numberSongs = document.getElementById("songsNumber").value
    let playbacks = await fetchRecentlyPlayed(accessToken, numberSongs)
    return playbacks.items
}

async function logNSongs(){
    clearConsole()
    let playbacks = await getPlaybacks()
    for (let i = 0; i<playbacks.length; i++){
        console.log(playbacks[i].track.name + " - " + playbacks[i].track.artists[0].name)
    }
}

function trackBlock(track){
    return `${track.name} - ${track.artists[0].name}`
}

async function updateSongsBlock(){
    let playbacks = await getPlaybacks()
    let songsBlock = document.getElementById("songs")
    songsBlock.innerHTML = ""
    for (let i=0; i<playbacks.length; i++){
        let newDiv = document.createElement("div")
        newDiv.innerHTML = trackBlock(playbacks[i].track)
        songsBlock.append(newDiv)
    }
}
