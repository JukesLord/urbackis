let iframeUrl = "xasxas";

// Save iframeUrl to localStorage with a 72-hour expiration
const now = Date.now();
const expiresAt = now + 72 * 60 * 60 * 1000; // 72 hours in ms
localStorage.setItem("iframeUrl", JSON.stringify({ value: iframeUrl, expiresAt }));

// Retrieve the value from localStorage and check expiration
let storedIframeUrl = localStorage.getItem("iframeUrl");
let retrievedIframeUrl = "";
if (storedIframeUrl) {
	const parsedIframe = JSON.parse(storedIframeUrl);
	if (parsedIframe.expiresAt > Date.now()) {
		retrievedIframeUrl = parsedIframe.value;
	} else {
		localStorage.removeItem("iframeUrl"); // expired
	}
}

console.log("Retrieved iframe URL:", retrievedIframeUrl);
