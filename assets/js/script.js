// Base URL configuration
const API_BASE_URL = window.location.origin;

// Helper function for API calls
async function fetchFromAPI(endpoint) {
	const response = await fetch(`${API_BASE_URL}${endpoint}`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
}

// Weekley Specials
async function fetchWeeklySpecials() {
	try {
		console.log("Fetching weekly specials..."); // Debug log
		const response = await fetch("/api/weekly-specials");
		const specials = await response.json();
		console.log("Received data:", specials); // Debug log

		const container = document.getElementById("weeklySpecialsWrapper");

		if (!specials || specials.length === 0) {
			console.log("No specials found"); // Debug log
			container.innerHTML =
				'<p class="no-specials">No weekly specials available at this time.</p>';
			return;
		}

		container.innerHTML = specials
			.map(
				(special) => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${
											special.image_url || "./assets/img/cannipure-logo.png"
										}" 
                         alt="${special.strain_name}" 
                         loading="lazy" />
                </div>

                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${
											special.strain_name || "Unknown Strain"
										}</p>
                    <p class="strain-card__type">${
											special.strain_type || "Unknown Type"
										}</p>
                </div>

                <div class="strain-card__category-holder">
                    <p class="strain-card__category">${
											special.category || "Uncategorized"
										}</p>
                </div>

                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(
											special.price || 0
										).toFixed(2)}</p>
                    <p class="strain-card__measurement">${
											special.measurement_unit || "/1g"
										}</p>
                </div>

                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${
											special.description || "No description available"
										}</p>
                </div>

                <div class="strain-card__indicator"></div>
            </div>
        `
			)
			.join("");

		console.log("Weekly specials rendered successfully"); // Debug log
	} catch (error) {
		console.error("Error fetching weekly specials:", error);
		const container = document.getElementById("weeklySpecialsWrapper");
		container.innerHTML =
			'<p class="error-message">Unable to load weekly specials. Please try again later.</p>';
	}
}

// Normal Strains
async function fetchNormalStrains() {
	try {
		console.log("Fetching normal strains...");
		const response = await fetch("/api/normal-strains");
		const strains = await response.json();
		console.log("Received normal strains data:", strains);

		const container = document.querySelector(
			"#normalStrains .category-section__card-holder"
		);

		if (!strains || strains.length === 0) {
			console.log("No normal strains found");
			container.innerHTML =
				'<p class="no-strains">No normal strains available at this time.</p>';
			return;
		}

		container.innerHTML = strains
			.map(
				(strain) => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${
											strain.image_url || "./assets/img/cannipure-logo.png"
										}" 
                         alt="${strain.strain_name}" 
                         loading="lazy" />
                </div>

                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${
											strain.strain_name || "Unknown Strain"
										}</p>
                    <p class="strain-card__type">${
											strain.strain_type || "Unknown Type"
										}</p>
                </div>

                <div class="strain-card__category-holder">
                    <p class="strain-card__category">NORMAL STRAIN</p>
                </div>

                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(
											strain.price || 0
										).toFixed(2)}</p>
                    <p class="strain-card__measurement">${
											strain.measurement_unit || "/1g"
										}</p>
                </div>

                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${
											strain.description || "No description available"
										}</p>
                </div>

                <div class="strain-card__indicator"></div>
            </div>
        `
			)
			.join("");

		console.log("Normal strains rendered successfully");
	} catch (error) {
		console.error("Error fetching normal strains:", error);
		const container = document.querySelector(
			"#normalStrains .category-section__card-holder"
		);
		container.innerHTML =
			'<p class="error-message">Unable to load normal strains. Please try again later.</p>';
	}
}

// Outdoor Strains
async function fetchOutdoorStrains() {
	try {
		console.log("Fetching outdoor strains...");
		const response = await fetch("/api/outdoor-strains");
		const strains = await response.json();
		console.log("Received outdoor strains data:", strains);

		const container = document.querySelector(
			"#outdoorStrains .category-section__card-holder"
		);

		if (!strains || strains.length === 0) {
			console.log("No outdoor strains found");
			container.innerHTML =
				'<p class="no-strains">No outdoor strains available at this time.</p>';
			return;
		}

		container.innerHTML = strains
			.map(
				(strain) => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${
											strain.image_url || "./assets/img/cannipure-logo.png"
										}" 
                         alt="${strain.strain_name}" 
                         loading="lazy" />
                </div>

                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${
											strain.strain_name || "Unknown Strain"
										}</p>
                    <p class="strain-card__type">${
											strain.strain_type || "Unknown Type"
										}</p>
                </div>

                <div class="strain-card__category-holder">
                    <p class="strain-card__category">OUTDOOR</p>
                </div>

                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(
											strain.price || 0
										).toFixed(2)}</p>
                    <p class="strain-card__measurement">${
											strain.measurement_unit || "/1g"
										}</p>
                </div>

                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${
											strain.description || "No description available"
										}</p>
                </div>

                <div class="strain-card__indicator"></div>
            </div>
        `
			)
			.join("");

		console.log("Outdoor strains rendered successfully");
	} catch (error) {
		console.error("Error fetching outdoor strains:", error);
		const container = document.querySelector(
			"#outdoorStrains .category-section__card-holder"
		);
		container.innerHTML =
			'<p class="error-message">Unable to load outdoor strains. Please try again later.</p>';
	}
}

// Greenhouse Strains
async function fetchGreenhouseStrains() {
    try {
        console.log('Fetching greenhouse strains...');
        const strains = await fetchFromAPI('/api/greenhouse-strains');
        const container = document.querySelector('#greenhouseStrains .category-section__card-holder');
        
        if (!strains || strains.length === 0) {
            container.innerHTML = '<p class="no-strains">No greenhouse strains available at this time.</p>';
            return;
        }

        container.innerHTML = strains.map(strain => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${strain.image_url || './assets/img/cannipure-logo.png'}" 
                         alt="${strain.strain_name}" 
                         loading="lazy" />
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${strain.strain_name}</p>
                    <p class="strain-card__type">${strain.strain_type}</p>
                </div>
                <div class="strain-card__category-holder">
                    <p class="strain-card__category">GREENHOUSE</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(strain.price).toFixed(2)}</p>
                    <p class="strain-card__measurement">${strain.measurement_unit}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${strain.description}</p>
                </div>
                <div class="strain-card__indicator"></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching greenhouse strains:', error);
        const container = document.querySelector('#greenhouseStrains .category-section__card-holder');
        container.innerHTML = '<p class="error-message">Unable to load greenhouse strains. Please try again later.</p>';
    }
}

// AAA Greenhouse Strains
async function fetchAAAGreenhouseStrains() {
    try {
        console.log('Fetching AAA greenhouse strains...');
        const strains = await fetchFromAPI('/api/aaa-greenhouse-strains');
        const container = document.querySelector('#aaaGreenhouseStrains .category-section__card-holder');
        
        if (!strains || strains.length === 0) {
            container.innerHTML = '<p class="no-strains">No AAA greenhouse strains available at this time.</p>';
            return;
        }

        container.innerHTML = strains.map(strain => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${strain.image_url || './assets/img/cannipure-logo.png'}" 
                         alt="${strain.strain_name}" 
                         loading="lazy" />
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${strain.strain_name}</p>
                    <p class="strain-card__type">${strain.strain_type}</p>
                </div>
                <div class="strain-card__category-holder">
                    <p class="strain-card__category">AAA GREENHOUSE</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(strain.price).toFixed(2)}</p>
                    <p class="strain-card__measurement">${strain.measurement_unit}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${strain.description}</p>
                </div>
                <div class="strain-card__indicator"></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching AAA greenhouse strains:', error);
        const container = document.querySelector('#aaaGreenhouseStrains .category-section__card-holder');
        container.innerHTML = '<p class="error-message">Unable to load AAA greenhouse strains. Please try again later.</p>';
    }
}

// AAA Indoor Strains
async function fetchAAAIndoorStrains() {
    try {
        console.log('Fetching AAA indoor strains...');
        const strains = await fetchFromAPI('/api/aaa-indoor-strains');
        const container = document.querySelector('#aaaIndoorStrains .category-section__card-holder');
        
        if (!strains || strains.length === 0) {
            container.innerHTML = '<p class="no-strains">No AAA indoor strains available at this time.</p>';
            return;
        }

        container.innerHTML = strains.map(strain => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${strain.image_url || './assets/img/cannipure-logo.png'}" 
                         alt="${strain.strain_name}" 
                         loading="lazy" />
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${strain.strain_name}</p>
                    <p class="strain-card__type">${strain.strain_type}</p>
                </div>
                <div class="strain-card__category-holder">
                    <p class="strain-card__category">AAA INDOOR</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(strain.price).toFixed(2)}</p>
                    <p class="strain-card__measurement">${strain.measurement_unit}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${strain.description}</p>
                </div>
                <div class="strain-card__indicator"></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching AAA indoor strains:', error);
        const container = document.querySelector('#aaaIndoorStrains .category-section__card-holder');
        container.innerHTML = '<p class="error-message">Unable to load AAA indoor strains. Please try again later.</p>';
    }
}

// Pre-Rolled
async function fetchPreRolled() {
    try {
        console.log('Fetching pre-rolled products...');
        const products = await fetchFromAPI('/api/pre-rolled');
        const container = document.querySelector('#preRolls .category-section__card-holder');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<p class="no-strains">No pre-rolled products available at this time.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${product.image_url || './assets/img/cannipure-logo.png'}" 
                         alt="${product.strain_name}" 
                         loading="lazy" />
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${product.strain_name}</p>
                    <p class="strain-card__type">${product.strain_type}</p>
                </div>
                <div class="strain-card__category-holder">
                    <p class="strain-card__category">PRE-ROLLED</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(product.price).toFixed(2)}</p>
                    <p class="strain-card__measurement">${product.measurement_unit}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${product.description}</p>
                </div>
                <div class="strain-card__indicator"></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching pre-rolled products:', error);
        const container = document.querySelector('#preRolls .category-section__card-holder');
        container.innerHTML = '<p class="error-message">Unable to load pre-rolled products. Please try again later.</p>';
    }
}

// Extracts and Vapes
async function fetchExtractsAndVapes() {
    try {
        console.log('Fetching extracts and vapes...');
        const products = await fetchFromAPI('/api/extracts-and-vapes');
        const container = document.querySelector('#extractsAndVapes .category-section__card-holder');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<p class="no-strains">No extracts and vapes available at this time.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${product.image_url || './assets/img/cannipure-logo.png'}" 
                         alt="${product.product_name}" 
                         loading="lazy" />
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${product.product_name}</p>
                    <p class="strain-card__type">${product.product_type}</p>
                </div>
                <div class="strain-card__category-holder">
                    <p class="strain-card__category">EXTRACTS & VAPES</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(product.price).toFixed(2)}</p>
                    <p class="strain-card__measurement">${product.measurement_unit}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${product.description}</p>
                </div>
                <div class="strain-card__indicator"></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching extracts and vapes:', error);
        const container = document.querySelector('#extractsAndVapes .category-section__card-holder');
        container.innerHTML = '<p class="error-message">Unable to load extracts and vapes. Please try again later.</p>';
    }
}

// Edibles
async function fetchEdibles() {
    try {
        console.log('Fetching edibles...');
        const products = await fetchFromAPI('/api/edibles');
        const container = document.querySelector('#edibles .category-section__card-holder');
        
        if (!products || products.length === 0) {
            container.innerHTML = '<p class="no-strains">No edibles available at this time.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${product.image_url || './assets/img/cannipure-logo.png'}" 
                         alt="${product.product_name}" 
                         loading="lazy" />
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${product.product_name}</p>
                    <p class="strain-card__type">${product.product_type}</p>
                </div>
                <div class="strain-card__category-holder">
                    <p class="strain-card__category">EDIBLES</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${Number(product.price).toFixed(2)}</p>
                    <p class="strain-card__measurement">${product.measurement_unit}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${product.description}</p>
                </div>
                <div class="strain-card__indicator"></div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching edibles:', error);
        const container = document.querySelector('#edibles .category-section__card-holder');
        container.innerHTML = '<p class="error-message">Unable to load edibles. Please try again later.</p>';
    }
}

// Membership Info
async function updateMembershipInfo(memberNumber) {
	try {
		const response = await fetch(`/api/membership/420-${memberNumber}`);
		const memberData = await response.json();

		if (memberData) {
			// Update status
			document.getElementById(
				"membershipStatus"
			).textContent = `Your membership status is currently ${memberData.status.toLowerCase()}.`;

			// Update details
			document.getElementById(
				"membershipDetails"
			).textContent = `Thank you for your continued support. You have been a loyal member for a whooping ${memberData.days_active} days now, keep your record unbroken by renewing your membership before the last day of each month.`;
		}
	} catch (error) {
		console.error("Error fetching membership:", error);
		document.getElementById("membershipStatus").textContent =
			"Unable to find membership. Please check your number.";
		document.getElementById("membershipDetails").textContent =
			"Please try again or contact support if the issue persists.";
	}
}

// DOM Elements
const elements = {
	hamburgerMenu: document.getElementById("hamburgerMenu"),
	mobileNav: document.getElementById("mobileNavigationList"),
	menuLines: document.querySelectorAll(".hamburger-menu__line"),
	overlay: document.getElementById("overlay"),
	pages: {
		home: document.getElementById("homePage"),
		lab: document.getElementById("labPage"),
		membership: document.getElementById("membershipCardHolder"),
		talkToUs: document.getElementById("talkToUsPage"),
	},
};

// Category Configuration
const categories = [
	{ buttonId: "outdoorBtn", sectionId: "outdoorStrains" },
	{ buttonId: "normalBtn", sectionId: "normalStrains" },
	{ buttonId: "greenhouseBtn", sectionId: "greenhouseStrains" },
	{ buttonId: "aaaGreenhouseBtn", sectionId: "aaaGreenhouseStrains" },
	{ buttonId: "aaaIndoorBtn", sectionId: "aaaIndoorStrains" },
	{ buttonId: "preRolledBtn", sectionId: "preRolls" },
	{ buttonId: "extractsAndVapesBtn", sectionId: "extractsAndVapes" },
	{ buttonId: "ediblesBtn", sectionId: "edibles" },
];

// Utility Functions
const toggleClass = (element, className, force) => {
	if (element) {
		element.classList.toggle(className, force);
	}
};

// Mobile Menu System
const toggleMenuSystem = (isOpen) => {
	toggleClass(elements.mobileNav, "menu-active", isOpen);
	elements.menuLines.forEach((line) => toggleClass(line, "ham-active", isOpen));
	toggleClass(elements.overlay, "hidden", !isOpen);
};

// Page Navigation
const showPage = (pageId) => {
	Object.entries(elements.pages).forEach(([key, page]) => {
		if (page) {
			toggleClass(page, "hidden", key !== "lab");
		}
	});

	if (pageId !== "labPage") {
		const selectedPage = document.getElementById(pageId);
		if (selectedPage) {
			toggleClass(elements.pages.lab, "hidden", true);
			toggleClass(selectedPage, "hidden", false);
		}
	}

	toggleMenuSystem(false);
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
	console.log("Page loaded, initializing..."); // Debug log

	// Initialize weekly specials
	fetchWeeklySpecials();

	// Initialize Normal Strains
	fetchNormalStrains();

	// Initialize Outdoor Strains
	fetchOutdoorStrains();

	// Initialize Greenhouse Strains
	fetchGreenhouseStrains();

	// Initialize AAA Greenhouse Strains
	fetchAAAGreenhouseStrains();

	// Initialize AAA Indoor Strains
	fetchAAAIndoorStrains();

	// Initialize Pre-Rolled
	fetchPreRolled();

	// Initialize Extracts and Vapes
	fetchExtractsAndVapes();

	// Initialize Edibles
	fetchEdibles();

	// Initialize Membership Card
	updateMembershipInfo();

	// Mobile Menu Events
	elements.hamburgerMenu?.addEventListener("click", () => {
		const shouldOpen = !elements.mobileNav.classList.contains("menu-active");
		toggleMenuSystem(shouldOpen);
	});

	elements.overlay?.addEventListener("click", () => toggleMenuSystem(false));

	// Category Configuration - Keep this part the same
	const categories = [
		{ buttonId: "outdoorBtn", sectionId: "outdoorStrains" },
		{ buttonId: "normalBtn", sectionId: "normalStrains" },
		{ buttonId: "greenhouseBtn", sectionId: "greenhouseStrains" },
		{ buttonId: "aaaGreenhouseBtn", sectionId: "aaaGreenhouseStrains" },
		{ buttonId: "aaaIndoorBtn", sectionId: "aaaIndoorStrains" },
		{ buttonId: "preRolledBtn", sectionId: "preRolls" },
		{ buttonId: "extractsAndVapesBtn", sectionId: "extractsAndVapes" },
		{ buttonId: "ediblesBtn", sectionId: "edibles" },
	];

	// Updated Category Section Toggle
	categories.forEach(({ buttonId, sectionId }) => {
		const button = document.getElementById(buttonId);
		const section = document.getElementById(sectionId);

		if (button && section) {
			button.addEventListener("click", () => {
				// Close all other sections first
				categories.forEach(({ sectionId: otherId }) => {
					if (otherId !== sectionId) {
						const otherSection = document.getElementById(otherId);
						if (otherSection) {
							otherSection.classList.remove("expanded");
							otherSection.style.height = "40px"; // Default height
						}
					}
				});

				// Toggle current section
				const isExpanded = section.classList.contains("expanded");

				if (!isExpanded) {
					section.classList.add("expanded");
					section.style.height = "400px"; // Expanded height
				} else {
					section.classList.remove("expanded");
					section.style.height = "40px"; // Default height
				}

				// Toggle button state
				button.classList.toggle("active");
			});
		} else {
			console.warn(
				`Element not found: ${
					!button ? `Button ID: ${buttonId}` : `Section ID: ${sectionId}`
				}`
			);
		}
	});

	// Membership Card Toggle

	document.getElementById("closeCardBtn")?.addEventListener("click", () => {
		toggleClass(elements.pages.membership, "hidden");
		toggleClass(elements.pages.lab, "hidden");
	});

	// Add this to prevent clicks on the card from closing it
	document.getElementById("membershipCard")?.addEventListener("click", (e) => {
		e.stopPropagation();
	});

	// Navigation Links
	document.addEventListener("click", (e) => {
		const link = e.target.closest("a");
		if (link) {
			const href = link.getAttribute("href");
			if (href?.startsWith("#")) {
				e.preventDefault();
				showPage(href.substring(1));
			}
		}
	});

	// Initialize page display
	const initialPage = window.location.hash.substring(1) || "labPage";
	showPage(initialPage);
});

// Temporary 404 Redirect Script (Valid until 2025-01-03 03:03:03)
document.addEventListener("DOMContentLoaded", function () {
	// Handle membership link clicks
	document.addEventListener("click", function (e) {
		// Check if clicked element is a membership link
		if (e.target.closest('a[href="#page404"]')) {
			e.preventDefault();

			// Hide all other pages
			document.getElementById("homePage").classList.add("hidden");
			document.getElementById("labPage").classList.add("hidden");
			document.getElementById("talkToUsPage").classList.add("hidden");
			document.getElementById("membershipCardHolder").classList.add("hidden");

			// Show 404 page
			const page404 = document.getElementById("page404");
			page404.style.display = "flex";

			// Close mobile menu if open
			const mobileNav = document.getElementById("mobileNavigationList");
			if (mobileNav.classList.contains("menu-active")) {
				mobileNav.classList.remove("menu-active");
				document.getElementById("overlay").classList.add("hidden");
			}
		}
	});

	// Handle return from 404 page
	document.addEventListener("click", function (e) {
		if (e.target.closest(".error-button")) {
			e.preventDefault();
			const page404 = document.getElementById("page404");
			page404.style.display = "none";

			// Get target page from button href
			const targetHref = e.target.closest(".error-button").getAttribute("href");
			const targetPage = targetHref.substring(1); // Remove #

			// Show target page
			document.getElementById(targetPage).classList.remove("hidden");
		}
	});
});

