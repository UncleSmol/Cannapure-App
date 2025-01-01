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
	// Hide all pages except lab
	Object.entries(elements.pages).forEach(([key, page]) => {
		if (page) {
			toggleClass(page, "hidden", key !== "lab");
		}
	});

	// If a specific page is selected and it's not lab, show it instead
	if (pageId !== "labPage") {
		const selectedPage = document.getElementById(pageId);
		if (selectedPage) {
			toggleClass(elements.pages.lab, "hidden", true);
			toggleClass(selectedPage, "hidden", false);
		}
	}

	// Reset mobile navigation when page changes
	toggleMenuSystem(false);
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
	// Mobile Menu Events
	elements.hamburgerMenu?.addEventListener("click", () => {
		const shouldOpen = !elements.mobileNav.classList.contains("menu-active");
		toggleMenuSystem(shouldOpen);
	});

	elements.overlay?.addEventListener("click", () => toggleMenuSystem(false));

	// Category Section Toggle
	categories.forEach(({ buttonId, sectionId }) => {
		const button = document.getElementById(buttonId);
		const section = document.getElementById(sectionId);

		if (button && section) {
			button.addEventListener("click", () => toggleClass(section, "h-auto"));
		} else {
			console.warn(
				`Element not found: ${
					!button ? `Button ID: ${buttonId}` : `Section ID: ${sectionId}`
				}`
			);
		}
	});

	// Membership Card Toggle
	elements.pages.membership?.addEventListener("click", () => {
		toggleClass(elements.pages.membership, "hidden");
		toggleClass(elements.pages.lab, "hidden");
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

// In your frontend JavaScript file
async function fetchStrains() {
    try {
        const response = await fetch('/api/strains');
        const strains = await response.json();
        
        const container = document.getElementById('weeklySpecialsWrapper');
        container.innerHTML = strains.map(strain => `
            <div class="strain-card">
                <div class="strain-card__image-holder">
                    <img src="${strain.image_url}" alt="${strain.strain_name}" loading="lazy" />
                </div>
                <div class="strain-card__name-holder">
                    <p class="strain-card__name">${strain.strain_name}</p>
                    <p class="strain-card__type">${strain.strain_type}</p>
                </div>
                <div class="strain-card__category-holder">
                    <p class="strain-card__category">${strain.category}</p>
                </div>
                <div class="strain-card__price-holder">
                    <p class="strain-card__price">R${strain.price.toFixed(2)}</p>
                    <p class="strain-card__measurement">${strain.measurement_unit}</p>
                </div>
                <div class="strain-card__description-holder">
                    <p class="strain-card__description">${strain.description}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching strains:', error);
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', fetchStrains);
