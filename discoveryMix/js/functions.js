const localhost = 8000

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTextFromFile(fileName){
    await fetch(fileName).then((res) => res.text()).then((text) => {
        tmp = text
    }).catch((e) => console.error(e))
    return tmp
}

async function getClientId(){
    clientId = await getTextFromFile("data/accessToken")
    return clientId
}

async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    var scopes = (await getTextFromFile("data/scopes") + '').split("\n").join(" ")
   
    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:"+localhost);
    params.append("scope", scopes);
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:"+localhost);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function logIn(clientId){
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code){
        redirectToAuthCodeFlow(clientId);
    }
    const accessToken = await getAccessToken(clientId, code);
    return accessToken
}

function clearConsole(){
    console.API;
    if (typeof console._commandLineAPI !== 'undefined') {
        console.API = console._commandLineAPI; //chrome
    } else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
        console.API = console._inspectorCommandLineAPI; //Safari
    } else if (typeof console.clear !== 'undefined') {
        console.API = console;
    }
    console.API.clear();
}

async function getUserId(accessToken) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    return data.id;
}

async function createPlaylist(playlistName, userId, accessToken, description) {
    
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const body = {
        name: playlistName,
        description: description,
        public: false
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Errore nella creazione della playlist: ${response.status}`);
    }
    let tmp = await response.json()

    return tmp.id;
}