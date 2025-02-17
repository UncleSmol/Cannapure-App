// Function to fetch and render weekly specials based on selected store
async function fetchAndRenderWeeklySpecials(store) {
	const container = document.getElementById("weeklySpecialsWrapper");

	if (!container) {
		console.error("weeklySpecialsWrapper not found");
		return;
	}

	// Clear existing content and show loading state
	container.innerHTML = `<p>Loading weekly specials...</p>`;

	try {
		// Construct API URL based on selected store
		const url = `http://localhost:3000/api/weekly_specials?store=${store}`;
		console.log("Fetching from:", url);

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		console.log("Weekly specials data received:", data);

		if (!data.success || !data.data || data.data.length === 0) {
			container.innerHTML = `<p>No weekly specials available at this time.</p>`;
			return;
		}

		// Generate HTML for each strain
		const html = data.data
			.map(
				(special) => `
            <div class="strain-card" data-id="${special.id}">
                <div class="strain-card__image-holder">
                    <img src="${
											special.image_url || "./assets/img/cannipure-logo.png"
										}" 
                         alt="${special.strain_name}" 
                         loading="lazy">
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${special.strain_name}</p>
                    <p class="strain-card__type">${special.strain_type}</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(
											special.price
										).toFixed(2)}</p>
                    <p class="strain-card__measurement">${
											special.measurement
										}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${
											special.description || "No description available"
										}</p>
                </div>
            </div>
        `
			)
			.join("");

		// Insert generated HTML
		container.innerHTML = html;
	} catch (error) {
		console.error("Error fetching weekly specials:", error);
		container.innerHTML = `<p>Error loading weekly specials. Please try again later.</p>`;
	}
}

// Event listener for store selection
document.querySelectorAll(".__store").forEach((button) => {
	button.addEventListener("click", (e) => {
		const selectedStore = e.target.id.toUpperCase();
		console.log("Selected store:", selectedStore);

		// Update button text
		document.getElementById("storeButtonText").textContent = selectedStore;

		// Fetch and render weekly specials for the selected store
		fetchAndRenderWeeklySpecials(selectedStore);
	});
});

// Load default store (WITBANK) on page load
document.addEventListener("DOMContentLoaded", () => {
	const defaultStore = "WITBANK";
	document.getElementById("storeButtonText").textContent = defaultStore;
	fetchAndRenderWeeklySpecials(defaultStore);
});
