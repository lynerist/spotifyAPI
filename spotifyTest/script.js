let clientId
fetch("accessToken").then((res) => res.text()).then((text) => {
    clientId = text
}).catch((e) => console.error(e))
await sleep(1000)

console.log(clientId)

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    populateUI(profile);
}
