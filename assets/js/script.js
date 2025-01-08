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
// Membership Card Handler (Added 2025-01-08 23:57:38)
const membershipElements = {
    input: document.getElementById('membershipNumberInput'),
    status: document.getElementById('membershipStatus'),
    details: document.getElementById('membershipDetails'),
    displayNumber: document.getElementById('displayMembershipNumber'),
    numberDisplay: document.querySelector('.membership-card__number')
};

const membershipMessages = {
    greetings() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good morning, early bird! ";
        if (hour >= 12 && hour < 17) return "Hey there! ";
        if (hour >= 17 && hour < 22) return "Good evening! ";
        return "Burning the midnight oil? ";
    },

    statusMessage(status) {
        switch(status.toLowerCase()) {
            case 'active':
                return "Your membership is active and ready to roll!";
            case 'expired':
                return "Looks like your membership needs a quick renewal to keep the good vibes flowing.";
            case 'pending':
                return "Almost there! Your membership is being processed.";
            default:
                return "Membership status unavailable.";
        }
    },

    durationMessage(days) {
        if (days < 30) return "Welcome to the family! You're just getting started.";
        if (days < 90) return `${days} days with us - the journey's just beginning!`;
        if (days < 365) return `${days} days and counting! You're becoming a regular face around here.`;
        return `Wow! ${days} days with us - you're practically family now!`;
    },

    renewalMessage(nextRenewalDate) {
        const daysUntilRenewal = Math.ceil((new Date(nextRenewalDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRenewal <= 7) {
            return `⚠️ Heads up! Your renewal is due in ${daysUntilRenewal} days (${new Date(nextRenewalDate).toLocaleDateString()}).`;
        }
        if (daysUntilRenewal <= 30) {
            return `Your next renewal is coming up on ${new Date(nextRenewalDate).toLocaleDateString()} - keep it in mind!`;
        }
        return `Your next renewal is scheduled for ${new Date(nextRenewalDate).toLocaleDateString()} - you're all set!`;
    }
};

async function initializeMembershipCard() {
	const membershipInput = membershipElements.input;

	if (membershipInput) {
		membershipInput.addEventListener("input", async function (e) {
			// Only allow numbers
			this.value = this.value.replace(/[^0-9]/g, "");

			// Check if we have exactly 3 digits
			if (this.value.length === 3) {
				try {
					// Disable input while checking
					this.setAttribute("disabled", true);

					// Format and call API
					const formattedNumber = `420-${this.value}`;
					const response = await fetch(`/api/membership/${formattedNumber}`);

					if (!response.ok) {
						// If membership not found, re-enable input
						this.removeAttribute("disabled");
						const errorData = await response.json();
						throw new Error(errorData.message);
					}

					const memberData = await response.json();
					updateMembershipDisplay(memberData);
				} catch (error) {
					console.error("Membership check failed:", error);
					showMembershipError();
				}
			}
		});
	}
}

function updateMembershipDisplay(memberData) {
	// Construct friendly message
	const greeting = membershipMessages.greetings();
	const statusMsg = membershipMessages.statusMessage(memberData.status);
	const durationMsg = membershipMessages.durationMessage(
		memberData.days_active
	);
	const renewalMsg = membershipMessages.renewalMessage(
		memberData.next_renewal_date
	);

	// Update status with greeting and status
	membershipElements.status.textContent = `${greeting}${statusMsg}`;

	// Add appropriate status class
	membershipElements.status.className = "membership-card__status";
	membershipElements.status.classList.add(
		`membership-card__status--${memberData.status.toLowerCase()}`
	);

	// Update details with duration and renewal info
	membershipElements.details.innerHTML = `
        ${durationMsg}<br><br>
        ${renewalMsg}
    `;

	// Show membership number
	membershipElements.displayNumber.textContent = memberData.membership_number;
	membershipElements.numberDisplay.classList.remove("hidden");
}

function showMembershipError() {
	membershipElements.input.removeAttribute("disabled");
	membershipElements.status.textContent =
		"Hmm... we couldn't find that membership number.";
	membershipElements.details.textContent =
		"Double-check the number and try again, or visit us in-store if you need help.";
	membershipElements.numberDisplay.classList.add("hidden");
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
	initializeMembershipCard();

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


