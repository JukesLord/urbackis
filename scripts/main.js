/* <script src="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js"></script> */

var link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css";
document.head.appendChild(link);
const addToCartBtn = document.querySelector('[data-testid="buttonAddToCart"]');
let imageSelected = false;

if (addToCartBtn) {
	addToCartBtn.addEventListener("click", (event) => {
		if (!imageSelected) {
			event.preventDefault(); // stop the form from submitting
			alert("Nejprve zvolte výřez mapy an náhledu níže");
		}
		// else allow form submission normally
	});
}
document.addEventListener("DOMContentLoaded", () => {
	const coordsBox = document.getElementById("map-coords");
	const input = document.getElementById("city-search");
	const searchBtn = document.getElementById("search-btn");
	const captureBtn = document.getElementById("capture-btn");
	const capturedImageContainer = document.getElementById("captured-image-container");

	mapboxgl.accessToken = "pk.eyJ1IjoidmFqIiwiYSI6ImNtYzdsbnZocDBxcjEyb3MzMm54amk0MG4ifQ.BxWiBUQHBr-1LgGff4PYjw";

	window.map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/vaj/cm8d5l3nn001701qw9w2nccbg",
		center: [14.428, 50.09],
		zoom: 12,
		preserveDrawingBuffer: true,
	});

	function updateCoordsDisplay() {
		const center = map.getCenter();
		coordsBox.value = `Zem. šířka: ${center.lat.toFixed(5)}, Zem. délka: ${center.lng.toFixed(5)}, Zoom: ${map
			.getZoom()
			.toFixed(2)}`;
	}

	map.on("load", () => {
		map.resize();
		updateCoordsDisplay();
	});

	map.on("move", updateCoordsDisplay);
	map.on("zoom", updateCoordsDisplay);

	async function search(query) {
		if (!query) return;
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${
			mapboxgl.accessToken
		}&limit=1`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.features.length > 0) {
				const [lng, lat] = data.features[0].center;
				map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
			} else {
				alert("Město nebylo nalezeno, zkuste to prosím znovu.");
			}
		} catch (error) {
			alert("Chyba při hledání města.");
			console.error(error);
		}
	}

	searchBtn.addEventListener("click", () => {
		const query = input.value.trim();
		search(query);
	});

	input.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const query = input.value.trim();
			search(query);
		}
	});

	captureBtn.addEventListener("click", () => {
		const canvas = map.getCanvas();

		if (!canvas) {
			alert("Nelze získat mapu.");
			return;
		}

		imageSelected = true;

		const dataUrl = canvas.toDataURL("image/png");

		// Helper to update image element attributes and styles
		function updateImage(img, src, altText, heightPx, objectFit = "contain") {
			if (!img) return;
			img.src = src;
			img.alt = altText;
			img.style.height = `${heightPx}px`;
			img.style.width = "auto";
			img.style.display = "block";
			img.style.objectFit = objectFit;
		}

		// ===== Update Main Product Image =====
		const mainImageDiv = document.querySelector('.p-image[data-testid="mainImage"]');
		if (!mainImageDiv) return; // early exit if main image container missing

		const anchor = mainImageDiv.querySelector("a");
		const mainImg = mainImageDiv.querySelector("img");
		const mainWrapper = document.getElementById("wrap");
		if (!(anchor && mainImg && mainWrapper)) return;

		anchor.href = dataUrl;
		anchor.setAttribute("data-href", dataUrl);

		const wrapperHeight = mainWrapper.clientHeight;
		updateImage(mainImg, dataUrl, "Mapa vlastního výřezu", wrapperHeight, "contain");

		// ===== Update Thumbnail & Lightbox =====
		const thumbnailsInner = document.querySelector(".p-thumbnails-inner div");
		if (!thumbnailsInner) return;

		const links = thumbnailsInner.querySelectorAll("a");
		if (links.length < 1) return;

		const firstThumbnail = links[0];
		if (firstThumbnail && firstThumbnail.classList.contains("p-thumbnail")) {
			const thumbImg = firstThumbnail.querySelector("img");
			if (thumbImg) {
				const thumbHeight = firstThumbnail.clientHeight;
				updateImage(thumbImg, dataUrl, "Náhled mapy", thumbHeight, "cover");
				thumbImg.setAttribute("data-src", dataUrl);
			}
			firstThumbnail.href = dataUrl;
		}
	});
});
