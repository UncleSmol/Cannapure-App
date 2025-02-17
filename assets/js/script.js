// ==============================================
// App Configuration and Initialization
// ==============================================

const App = {
	config: {
		// API Configuration
		api: {
			baseUrl: "http://localhost:3000/api",
			endpoints: {
				weeklySpecials: "/weekly_specials",
				categories: {
					normalStrains: "/normal_strains",
					greenhouseStrains: "/greenhouse_strains",
					exoticTunnelStrains: "/exotic_tunnel_strains",
					indoorStrains: "/indoor_strains",
					medicalStrains: "/medical_strains",
					preRolls: "/pre_rolled",
					extractsAndVapes: "/extracts_vapes",
					edibles: "/edibles",
				},
				auth: {
					login: "/auth/login",
					register: "/auth/register",
					logout: "/auth/logout",
				},
			},
		},

		// Store Locations
		stores: {
			WITBANK: "WITBANK",
			DULLSTROOM: "DULLSTROOM",
		},

		// Valid Pages for Navigation
		validPages: [
			"homePage",
			"theBudBarPage",
			"membershipCardHolder",
			"talkToUsPage",
			"userAuthenticationPage",
			"page404",
		],

		// CSS Classes
		classes: {
			hidden: "hidden",
			visible: "visible",
			selected: "selected",
			expanded: "h-auto",
		},

		// Password Validation Rules
		password: {
			minLength: 8,
			maxLength: 64,
			specialChars: "@$!%*?&#^",
			requirements: [
				{ regex: /.{8,64}/, message: "Password must be 8-64 characters long" },
				{ regex: /[A-Z]/, message: "At least one uppercase letter" },
				{ regex: /[a-z]/, message: "At least one lowercase letter" },
				{ regex: /[0-9]/, message: "At least one number" },
				{
					regex: /[@$!%*?&#^]/,
					message: "At least one special character (@$!%*?&#^)",
				},
			],
		},

		// Validation Patterns
		validation: {
			email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
			phone: /^(?:\+27|0)[6-8][0-9]{8}$/,
			idNumber: /^[0-9]{13}$/,
		},

		// UI Configuration
		ui: {
			breakpoints: {
				mobile: 768,
				tablet: 1024,
				desktop: 1280,
			},
			animations: {
				duration: 300,
				timing: "ease",
			},
			toastDuration: 3000,
		},

		// Error Messages
		errors: {
			network:
				"Network connection error. Please check your internet connection.",
			auth: {
				invalidLogin: "Invalid email or password",
				invalidToken: "Your session has expired. Please login again.",
				registrationFailed: "Registration failed. Please try again.",
			},
			validation: {
				required: "This field is required",
				invalidEmail: "Please enter a valid email address",
				invalidPhone: "Please enter a valid South African phone number",
				invalidId: "Please enter a valid South African ID number",
				underage: "You must be 18 or older to register",
			},
		},
	},

	// Elements object (for DOM references)
	elements: {},

	// Cache elements method
	cacheElements() {
		this.elements = {
			store: {
				container: document.getElementById("shops"),
				circleBtn: document.getElementById("storeCircleBtn"),
				buttonText: document.getElementById("storeButtonText"),
				options: document.getElementById("storeOptions"),
				storeButtons: document.querySelectorAll(".__store"),
			},
			navigation: {
				desktopNav: document.querySelector(".site-header__nav"),
				mobileNav: document.getElementById("mobileNavigationList"),
				hamburger: document.getElementById("hamburgerMenu"),
				membershipClose: document.getElementById("closeCardBtn"),
			},
			categories: {
				toggleButtons: document.querySelectorAll(
					".category-section__btn.opn-cls-btn"
				),
				sections: document.querySelectorAll(".category-section"),
				weeklySpecials: document.getElementById("weeklySpecialsWrapper"),
				normalStrains: document.querySelector(
					"#normalStrains .category-section__card-holder"
				),
				greenhouseStrains: document.querySelector(
					"#greenhouseStrains .category-section__card-holder"
				),
				exoticTunnelStrains: document.querySelector(
					"#exoticTunnelStrains .category-section__card-holder"
				),
				indoorStrains: document.querySelector(
					"#indoorStrains .category-section__card-holder"
				),
				medicalStrains: document.querySelector(
					"#medicalStrains .category-section__card-holder"
				),
				preRolls: document.querySelector(
					"#preRolls .category-section__card-holder"
				),
				extractsAndVapes: document.querySelector(
					"#extractsAndVapes .category-section__card-holder"
				),
				edibles: document.querySelector(
					"#edibles .category-section__card-holder"
				),
			},
		};
	},
};

// ==============================================
// State Management Module
// ==============================================

App.State = {
	// State Storage
	current: {
		// Navigation State
		selectedStore: localStorage.getItem("selectedStore") || null,
		activePage: window.location.hash.slice(1) || "homePage",

		// UI State
		isStoreOptionsVisible: false,
		expandedCategory: null,
		isMobileNavOpen: false,

		// Loading State
		isLoading: false,

		// Error State
		errors: [],
	},

	// Initialization
	init() {
		// First handle page change (doesn't depend on other modules)
		this.notifyPageChange(this.current.activePage);

		// Setup listeners before any data operations
		this.setupStateListeners();

		// Don't automatically trigger store refresh on init
		// Just set the store without refreshing data
		if (this.current.selectedStore) {
			const { buttonText, container, storeButtons } = App.elements.store;

			if (buttonText) buttonText.textContent = this.current.selectedStore;
			if (container)
				container.classList.toggle(App.config.classes.selected, true);

			storeButtons.forEach((btn) => {
				btn.classList.toggle(
					App.config.classes.selected,
					btn.id.toUpperCase() === this.current.selectedStore
				);
			});
		}
	},

	// Store Management
	setStore(store) {
		if (!App.config.stores[store]) return;

		this.current.selectedStore = store;
		localStorage.setItem("selectedStore", store);
		this.notifyStoreChange(store);
	},

	notifyStoreChange(store) {
		const { buttonText, container, storeButtons } = App.elements.store;

		if (buttonText) buttonText.textContent = store;
		if (container)
			container.classList.toggle(App.config.classes.selected, !!store);

		storeButtons.forEach((btn) => {
			btn.classList.toggle(
				App.config.classes.selected,
				btn.id.toUpperCase() === store
			);
		});

		// Only refresh data if App.Data is initialized
		if (App.Data.cache) {
			App.Data.refreshWeeklySpecials(store);
			App.Data.refreshCategories(store);
		}
	},

	// Page Navigation
	setActivePage(page) {
		if (page === "theBudBarPage") {
			App.Auth.checkBudBarAccess();
		}

		this.current.activePage = page;
		this.notifyPageChange(page);
	},

	notifyPageChange(page) {
		window.history.pushState(null, "", `#${page}`);

		App.config.validPages.forEach((pid) => {
			const el = document.getElementById(pid);
			if (el) el.classList.toggle(App.config.classes.hidden, pid !== page);
		});

		if (this.current.isMobileNavOpen) {
			App.UI.Navigation.closeMobileNav();
		}
	},

	// UI State Management
	toggleStoreOptions(force) {
		this.current.isStoreOptionsVisible =
			force !== undefined ? force : !this.current.isStoreOptionsVisible;

		const options = App.elements.store.options;
		if (options) {
			options.classList.toggle(
				App.config.classes.visible,
				this.current.isStoreOptionsVisible
			);
		}
	},

	setExpandedCategory(cat) {
		this.current.expandedCategory =
			this.current.expandedCategory === cat ? null : cat;

		App.elements.categories.sections.forEach((section) => {
			section.classList.toggle(
				App.config.classes.expanded,
				section.id === this.current.expandedCategory
			);
		});
	},

	// Loading State Management
	setLoading(isLoading) {
		this.current.isLoading = isLoading;
		const loader = document.getElementById("loadingIndicator");
		if (loader) {
			loader.classList.toggle(App.config.classes.hidden, !isLoading);
		}
	},

	// Error Management
	addError(err) {
		const error = {
			id: Date.now(),
			message: err.message,
			timestamp: new Date(),
		};

		this.current.errors.push(error);
		App.UI.showError(error);

		// Clean up old errors
		this.cleanupErrors();
	},

	cleanupErrors() {
		const FIVE_MINUTES = 5 * 60 * 1000;
		const now = Date.now();

		this.current.errors = this.current.errors.filter(
			(error) => now - error.timestamp < FIVE_MINUTES
		);
	},

	// State Listeners
	setupStateListeners() {
		window.addEventListener("storage", this.handleStorageChange.bind(this));
		window.addEventListener("hashchange", this.handleHashChange.bind(this));
	},

	handleStorageChange(event) {
		if (event.key === "selectedStore") {
			const newStore = event.newValue;
			if (newStore !== this.current.selectedStore) {
				this.setStore(newStore);
			}
		}
	},

	handleHashChange() {
		const newPage = window.location.hash.slice(1) || "homePage";
		if (newPage !== this.current.activePage) {
			this.setActivePage(newPage);
		}
	},
};

// ==============================================
// UI Module
// ==============================================

App.UI = {
	// Initialize all UI components
	init() {
		this.Store.init();
		this.Navigation.init();
		this.Categories.init();
		this.Notifications.init();
	},

	// Store UI Management
	Store: {
		init() {
			const { circleBtn, storeButtons } = App.elements.store;

			// Store circle button handler
			circleBtn?.addEventListener("click", this.handleStoreButtonClick);

			// Store selection handlers
			storeButtons.forEach((btn) => {
				btn.addEventListener("click", this.handleStoreSelection);
			});

			// Outside click handler
			document.addEventListener("click", this.handleOutsideClick);
		},

		handleStoreButtonClick(e) {
			e.stopPropagation();
			App.State.toggleStoreOptions();
		},

		handleStoreSelection(e) {
			const store = e.target.id.toUpperCase();
			App.State.setStore(store);

			// Delayed hide for better UX
			setTimeout(() => {
				App.State.toggleStoreOptions(false);
			}, 300);
		},

		handleOutsideClick(e) {
			if (!document.getElementById("shops").contains(e.target)) {
				App.State.toggleStoreOptions(false);
			}
		},
	},

	// Navigation Management
	Navigation: {
		init() {
			const { desktopNav, mobileNav, hamburger, membershipClose } =
				App.elements.navigation;

			// Navigation click handlers
			desktopNav?.addEventListener("click", this.handleNavClick);
			mobileNav?.addEventListener("click", this.handleNavClick);
			hamburger?.addEventListener("click", this.toggleMobileNav);

			// Membership close handler
			membershipClose?.addEventListener("click", this.handleMembershipClose);

			// History navigation
			window.addEventListener("popstate", this.handlePopState);
		},

		handleNavClick(e) {
			const link = e.target.closest('a[href^="#"]');
			if (link) {
				e.preventDefault();
				const page = link.getAttribute("href").slice(1);
				App.State.setActivePage(page);
			}
		},

		toggleMobileNav() {
			const { mobileNav, hamburger } = App.elements.navigation;
			const isOpen = mobileNav.classList.toggle("menu-active");

			hamburger.querySelectorAll(".hamburger-menu__line").forEach((span) => {
				span.classList.toggle("ham-active", isOpen);
			});

			App.State.current.isMobileNavOpen = isOpen;
		},

		closeMobileNav() {
			const { mobileNav, hamburger } = App.elements.navigation;
			mobileNav.classList.remove("menu-active");

			hamburger.querySelectorAll(".hamburger-menu__line").forEach((span) => {
				span.classList.remove("ham-active");
			});

			App.State.current.isMobileNavOpen = false;
		},

		handleMembershipClose(e) {
			e.preventDefault();
			App.State.setActivePage("theBudBarPage");
		},

		handlePopState() {
			App.State.setActivePage(window.location.hash.slice(1) || "homePage");
		},
	},

	// Categories Management
	Categories: {
		init() {
			App.elements.categories.toggleButtons.forEach((btn) => {
				btn.addEventListener("click", this.handleCategoryToggle);
			});
		},

		handleCategoryToggle(e) {
			const section = e.target.closest(".category-section");
			if (section) {
				App.State.setExpandedCategory(section.id);
			}
		},
	},

	// Notification System
	Notifications: {
		init() {
			this.setupStyles();
		},

		setupStyles() {
			const style = document.createElement("style");
			style.textContent = `
                .toast-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100%);
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    padding: 12px 24px;
                    border-radius: var(--radius-md);
                    color: var(--white);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: transform 0.3s ease;
                    z-index: 1000;
                }
                .toast-notification.show {
                    transform: translateX(-50%) translateY(0);
                }
            `;
			document.head.appendChild(style);
		},

		showError(err) {
			const errorEl = document.createElement("div");
			errorEl.className = "error-notification";
			errorEl.innerHTML = `
                <p>${err.message}</p>
                <button onclick="this.parentElement.remove()">×</button>
            `;
			document.body.appendChild(errorEl);
			setTimeout(() => errorEl.remove(), 5000);
		},

		showToast(msg, duration = 3000) {
			const toast = document.createElement("div");
			toast.className = "toast-notification";
			toast.textContent = msg;
			document.body.appendChild(toast);

			requestAnimationFrame(() => toast.classList.add("show"));

			setTimeout(() => {
				toast.classList.remove("show");
				setTimeout(() => toast.remove(), 300);
			}, duration);
		},
	},
};

// ==============================================
// Data Module & API Handlers
// ==============================================

App.Data = {
	// Initialize data module
	init() {
		this.cache = new Map();
		this.wrapper = App.elements.categories.weeklySpecials;
		if (!this.wrapper) console.error("Weekly specials container missing");
	},

	// API Request Handler
	async fetchData(endpoint, params = {}) {
		const queryString = new URLSearchParams(params).toString();
		const url = `${App.config.api.baseUrl}${endpoint}?${queryString}`;
		const cacheKey = url;

		// Check cache first
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			const response = await this.fetchWithRetry(url);
			if (!response.ok) throw new Error(`HTTP error ${response.status}`);

			const data = await response.json();
			if (!data.success) throw new Error(data.error || "API Error");

			// Cache successful response
			this.cache.set(cacheKey, data);
			return data;
		} catch (error) {
			console.error(`Fetch error for ${endpoint}:`, error);
			throw error;
		}
	},

	async fetchWithRetry(url, retries = 3) {
		for (let i = 0; i < retries; i++) {
			try {
				return await fetch(url);
			} catch (error) {
				if (i === retries - 1) throw error;
				await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
			}
		}
	},

	// Data Fetching Methods
	async refreshWeeklySpecials(store) {
		if (!store) {
			console.log("No store selected, skipping data fetch.");
			return;
		}

		App.State.setLoading(true);
		try {
			const result = await this.fetchData("/weekly_specials", { store });
			this.renderWeeklySpecials(result.data);
		} catch (error) {
			this.handleError(error, "weekly specials");
		} finally {
			App.State.setLoading(false);
		}
	},

	async refreshCategories(store) {
		if (!store) {
			console.log("No store selected, skipping data fetch.");
			return;
		}

		App.State.setLoading(true);
		try {
			const categories = Object.keys(App.config.api.endpoints.categories);
			await Promise.all(
				categories.map(async (category) => {
					try {
						const result = await this.fetchData(
							App.config.api.endpoints.categories[category],
							{ store }
						);
						this.renderCategory(category, result.data);
					} catch (error) {
						this.handleError(error, category);
					}
				})
			);
		} finally {
			App.State.setLoading(false);
		}
	},

	// Error Handling
	handleError(error, context) {
		console.error(`Error fetching ${context}:`, error);
		const message = `Could not load ${context}. ${error.message}`;

		if (context === "weekly specials" && this.wrapper) {
			this.wrapper.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                </div>
            `;
		}

		App.UI.Notifications.showToast(message);
	},

	// Rendering Methods
	renderWeeklySpecials(specials) {
		if (!this.wrapper) return;

		if (!specials?.length) {
			this.wrapper.innerHTML = `
                <div class="no-specials">
                    <p>No weekly specials available.</p>
                </div>`;
			return;
		}

		const html = specials
			.map((special) =>
				this.createSpecialCard(this.transformSpecialData(special))
			)
			.join("");

		this.wrapper.innerHTML = html;
		this.initializeLazyLoading();
	},

	renderCategory(category, items) {
		const wrapper = App.elements.categories[category];
		if (!wrapper) return;

		if (!items?.length) {
			wrapper.innerHTML = `
                <div class="no-specials">
                    <p>No items available in this category.</p>
                </div>`;
			return;
		}

		const html = items
			.map((item) => this.createSpecialCard(this.transformSpecialData(item)))
			.join("");

		wrapper.innerHTML = html;
		this.initializeLazyLoading();
	},

	// Data Transformation
	transformSpecialData(item) {
		return {
			id: item.id,
			image_url: item.image_url || "./assets/img/cannipure-logo.png",
			strain_name: this.sanitizeText(item.strain_name),
			strain_type: this.sanitizeText(item.strain_type),
			price: Number(item.price).toFixed(2),
			measurement: this.sanitizeText(item.measurement),
			description:
				this.sanitizeText(item.description) || "No description available",
		};
	},

	sanitizeText(text) {
		if (!text) return "";
		return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
	},

	// Card Creation
	createSpecialCard(item) {
		return `
            <div class="strain-card" data-id="${item.id}">
                <div class="strain-card__image-holder">
                    <img src="${item.image_url}" 
                         alt="${item.strain_name}" 
                         loading="lazy">
                </div>
                <div class="strain-card__info">
                    <p class="strain-card__name">${item.strain_name}</p>
                    <div class="__content-wrapper">
                        <p class="strain-card__type">${item.strain_type}</p>
                        <p class="strain-card__price">R${item.price}</p>
                        <p class="strain-card__measurement">${item.measurement}</p>
                    </div>
                    <p class="strain-card__description">${item.description}</p>
                </div>
            </div>
        `;
	},

	// Lazy Loading
	initializeLazyLoading() {
		const images = document.querySelectorAll('img[loading="lazy"]');
		images.forEach((img) => {
			img.addEventListener("load", () => img.classList.add("loaded"));
			img.addEventListener("error", () => {
				img.src = "./assets/img/cannipure-logo.png";
			});
		});
	},
};

// ==============================================
// App Real-Time Data Validation
// ==============================================

App.Auth = {
	init() {
		this.setupFormValidation();
		this.setupAuthTabs();
		this.setupFormSubmission();
		this.checkAuthState();
	},

	// Validation Rules
	validators: {
		idNumber: {
			pattern: /^[0-9]{13}$/,
			validate(id) {
				if (!this.pattern.test(id)) return "ID number must be 13 digits";

				// Extract date parts
				const year = parseInt(id.substring(0, 2));
				const month = parseInt(id.substring(2, 4));
				const day = parseInt(id.substring(4, 6));

				// Validate date
				const currentYear = new Date().getFullYear() % 100;
				const fullYear = year <= currentYear ? 2000 + year : 1900 + year;
				const birthDate = new Date(fullYear, month - 1, day);

				// Check age (must be 18 or older)
				const age = this.calculateAge(birthDate);
				if (age < 18) return "Must be 18 or older to register";

				return null;
			},
			calculateAge(birthDate) {
				const today = new Date();
				let age = today.getFullYear() - birthDate.getFullYear();
				const monthDiff = today.getMonth() - birthDate.getMonth();
				if (
					monthDiff < 0 ||
					(monthDiff === 0 && today.getDate() < birthDate.getDate())
				) {
					age--;
				}
				return age;
			},
		},

		email: {
			pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
			validate(email) {
				if (!email) return "Email is required";
				if (!this.pattern.test(email)) return "Invalid email format";
				return null;
			},
		},

		phone: {
			pattern: /^(?:\+27|0)[6-8][0-9]{8}$/,
			validate(phone) {
				if (!this.pattern.test(phone))
					return "Invalid South African phone number";
				return null;
			},
		},

		password: {
			...App.config.password, // Using password config from App.config
			validate(password) {
				if (!password) return "Password is required";

				const failedRequirements = [];

				// Check minimum requirements
				this.requirements.forEach((req) => {
					if (!req.regex.test(password)) {
						failedRequirements.push(req.message);
					}
				});

				// Check for common patterns
				if (/^12345|password|qwerty|abc123/i.test(password)) {
					failedRequirements.push("Password is too common");
				}

				return failedRequirements.length ? failedRequirements : null;
			},
		},
	},

	// Form Validation Setup
	setupFormValidation() {
		const registerForm = document.getElementById("registerForm");
		const loginForm = document.getElementById("loginForm");

		if (registerForm) {
			this.setupInputValidation("UserIdNumber", "idNumber");
			this.setupInputValidation("registerEmail", "email");
			this.setupInputValidation("phone", "phone");
			this.setupPasswordValidation();
		}

		if (loginForm) {
			this.setupInputValidation("loginEmail", "email");
		}
	},

	setupInputValidation(inputId, validatorKey) {
		const input = document.getElementById(inputId);
		if (!input) return;

		const errorDiv = document.createElement("div");
		errorDiv.className = "error-message";
		input.parentNode.appendChild(errorDiv);

		input.addEventListener("input", () => {
			const error = this.validators[validatorKey].validate(input.value);
			errorDiv.textContent = error || "";
			input.classList.toggle("invalid", !!error);
		});
	},

	setupPasswordValidation() {
		const passwordInput = document.getElementById("registerPassword");
		const strengthBar = document.querySelector(".strength-bar");
		const requirementsDiv = document.querySelector(".password-requirements");

		if (!passwordInput) return;

		// Add requirements list
		const requirementsList = document.createElement("ul");
		this.validators.password.requirements.forEach((req) => {
			const li = document.createElement("li");
			li.textContent = req.message;
			requirementsList.appendChild(li);
		});
		requirementsDiv?.appendChild(requirementsList);

		passwordInput.addEventListener("input", (e) => {
			const password = e.target.value;
			const strength = this.checkPasswordStrength(password);

			// Update strength bar
			if (strengthBar) {
				strengthBar.style.width = `${(strength.score / 8) * 100}%`;
				strengthBar.style.backgroundColor = strength.color;
			}

			// Update requirements list
			if (requirementsList) {
				const requirements = requirementsList.getElementsByTagName("li");
				this.validators.password.requirements.forEach((req, index) => {
					if (requirements[index]) {
						const ismet = req.regex.test(password);
						requirements[index].classList.toggle("requirement-met", ismet);
						requirements[index].classList.toggle("requirement-unmet", !ismet);
					}
				});
			}
		});
	},

	// Auth Tabs Management
	setupAuthTabs() {
		const loginTab = document.getElementById("loginTab");
		const registerTab = document.getElementById("registerTab");
		const loginForm = document.getElementById("loginFormContainer");
		const registerForm = document.getElementById("registerFormContainer");

		if (!loginTab || !registerTab || !loginForm || !registerForm) {
			console.warn("Auth tab elements missing");
			return;
		}

		loginTab.addEventListener("click", () => this.switchTab("login"));
		registerTab.addEventListener("click", () => this.switchTab("register"));
	},

	switchTab(tab) {
		const loginTab = document.getElementById("loginTab");
		const registerTab = document.getElementById("registerTab");
		const loginForm = document.getElementById("loginFormContainer");
		const registerForm = document.getElementById("registerFormContainer");

		if (tab === "login") {
			loginTab.classList.add("active-tab");
			registerTab.classList.remove("active-tab");
			loginForm.classList.remove("hidden");
			registerForm.classList.add("hidden");
		} else {
			registerTab.classList.add("active-tab");
			loginTab.classList.remove("active-tab");
			registerForm.classList.remove("hidden");
			loginForm.classList.add("hidden");
		}
	},

	// Form Submission
	setupFormSubmission() {
		const loginForm = document.getElementById("loginForm");
		const registerForm = document.getElementById("registerForm");

		loginForm?.addEventListener("submit", this.handleLogin.bind(this));
		registerForm?.addEventListener(
			"submit",
			this.handleRegistration.bind(this)
		);
	},

	async handleRegistration(e) {
		e.preventDefault();

		// Collect form data
		const formData = {
			idNumber: document.getElementById("UserIdNumber").value,
			firstName: document.getElementById("firstName").value,
			surname: document.getElementById("surname").value,
			email: document.getElementById("registerEmail").value,
			phone: document.getElementById("phone").value,
			password: document.getElementById("registerPassword").value,
			address: document.getElementById("residentialAddress").value,
		};

		// Validate all fields
		const errors = this.validateRegistrationData(formData);
		if (errors.length) {
			App.UI.Notifications.showToast(errors[0]);
			return;
		}

		try {
			// Handle registration logic here
			// You'll need to implement the actual API call
		} catch (error) {
			App.UI.Notifications.showToast(error.message);
		}
	},

	validateRegistrationData(data) {
		const errors = [];

		const idError = this.validators.idNumber.validate(data.idNumber);
		const emailError = this.validators.email.validate(data.email);
		const phoneError = this.validators.phone.validate(data.phone);
		const passwordErrors = this.validators.password.validate(data.password);

		if (idError) errors.push(idError);
		if (emailError) errors.push(emailError);
		if (phoneError) errors.push(phoneError);
		if (passwordErrors) errors.push(...passwordErrors);

		return errors;
	},

	checkPasswordStrength(password) {
		let strength = 0;

		// Length contribution
		if (password.length >= 12) strength += 2;
		else if (password.length >= 8) strength += 1;

		// Character variety
		if (/[A-Z]/.test(password)) strength += 1;
		if (/[a-z]/.test(password)) strength += 1;
		if (/[0-9]/.test(password)) strength += 1;
		if (new RegExp(`[${this.validators.password.specialChars}]`).test(password))
			strength += 1;

		// Extra strength checks
		if (/(?=.*[A-Z].*[A-Z])/.test(password)) strength += 1;
		if (
			new RegExp(
				`(?=.*[${this.validators.password.specialChars}].*[${this.validators.password.specialChars}])`
			).test(password)
		)
			strength += 1;
		if (password.length >= 16) strength += 1;

		return {
			score: strength,
			label:
				strength < 3
					? "Weak"
					: strength < 5
					? "Moderate"
					: strength < 7
					? "Strong"
					: "Very Strong",
			color:
				strength < 3
					? "#dc3545"
					: strength < 5
					? "#ffc107"
					: strength < 7
					? "#28a745"
					: "#20c997",
		};
	},

	checkBudBarAccess() {
		const budBarPage = document.getElementById("theBudBarPage");

		if (!budBarPage) return;

		// Check if user is logged in
		const isLoggedIn = localStorage.getItem("authToken");

		if (!isLoggedIn) {
			// Create blur overlay if it doesn't exist
			if (!budBarPage.querySelector(".blur-overlay")) {
				const overlay = document.createElement("div");
				overlay.className = "blur-overlay";
				overlay.innerHTML = `
                <div class="auth-message">
                    <h3>You need an account to access this content</h3>
                    <button onclick="App.State.setActivePage('userAuthenticationPage')">
                        Login / Register
                    </button>
                </div>
            `;
				budBarPage.appendChild(overlay);
			}
		} else {
			// Remove overlay if it exists
			const overlay = budBarPage.querySelector(".blur-overlay");
			if (overlay) {
				overlay.remove();
			}
		}
	},

	// Authentication state management
	isAuthenticated() {
		return localStorage.getItem("authToken") !== null;
	},

	// Store user data after login
	setAuthenticatedUser(userData) {
		localStorage.setItem("authToken", userData.token);
		localStorage.setItem("userCPNumber", userData.cpNumber);
		localStorage.setItem("userEmail", userData.email);
	},

	// Clear auth data on logout
	clearAuth() {
		localStorage.removeItem("authToken");
		localStorage.removeItem("userCPNumber");
		localStorage.removeItem("userEmail");
	},

	// Navigation management
	storeIntendedDestination(destination) {
		sessionStorage.setItem("intendedDestination", destination);
	},

	getIntendedDestination() {
		return sessionStorage.getItem("intendedDestination");
	},

	clearIntendedDestination() {
		sessionStorage.removeItem("intendedDestination");
	},

	// handle Login method
	async handleLogin(e) {
		e.preventDefault();

		const email = document.getElementById("loginEmail").value;
		const password = document.getElementById("loginPassword").value;
		const cpdNumber = document.getElementById("cpdNumber").value;

		// Validate inputs
		const emailError = this.validators.email.validate(email);
		if (emailError) {
			App.UI.Notifications.showToast(emailError);
			return;
		}

		try {
			const response = await fetch("/api/auth/login", {
				// Changed to relative path
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"CSRF-Token": document.cookie.split("XSRF-TOKEN=")[1]?.split(";")[0],
				},
				credentials: "include",
				body: JSON.stringify({
					email,
					password,
					cpNumber: cpdNumber,
				}),
			});

			const data = await response.json();

			if (data.success) {
				localStorage.setItem("authToken", data.token);
				this.updateLoginStatus();
				App.UI.Notifications.showToast("Login successful!");
				App.State.setActivePage("homePage");
			} else {
				App.UI.Notifications.showToast(data.error || "Login failed");
			}
		} catch (error) {
			App.UI.Notifications.showToast(error.message);
		}
	},

	updateLoginStatus() {
		const isLoggedIn = localStorage.getItem("authToken");

		// Desktop nav - target last list item
		const desktopAuthLink = document.querySelector(
			".site-header__nav li:last-child a"
		);
		if (desktopAuthLink) {
			desktopAuthLink.textContent = isLoggedIn ? "LOGOUT" : "LOGIN";
		}

		// Mobile nav - target last list item
		const mobileAuthText = document.querySelector(
			".mobile-nav__list li:last-child .mobile-nav__text"
		);
		const mobileAuthIcon = document.querySelector(
			".mobile-nav__list li:last-child .mobile-nav__icon img"
		);

		if (mobileAuthText) {
			mobileAuthText.textContent = isLoggedIn ? "LOGOUT" : "LOGIN";
		}

		if (mobileAuthIcon) {
			mobileAuthIcon.style.transform = isLoggedIn
				? "rotateY(180deg)"
				: "rotateY(0)";
			mobileAuthIcon.style.transition = "transform 0.3s ease";
		}

		// Update click handlers for last items
		if (isLoggedIn) {
			const authLinks = document.querySelectorAll(
				".site-header__nav li:last-child a, .mobile-nav__list li:last-child a"
			);
			authLinks.forEach((link) => {
				link.onclick = (e) => {
					e.preventDefault();
					this.handleLogout();
				};
			});
		}
	},
	// Add logout handler
	async handleLogout() {
		try {
			// Clear auth data
			localStorage.removeItem("authToken");

			// Update UI
			this.updateLoginStatus();

			// Show notification
			App.UI.Notifications.showToast("Logged out successfully");

			// Redirect to home
			App.State.setActivePage("homePage");
		} catch (error) {
			App.UI.Notifications.showToast("Logout failed: " + error.message);
		}
	},
	// Add this to App.Auth
	checkAuthState() {
		const token = localStorage.getItem("authToken");
		if (token) {
			// User is logged in
			this.updateLoginStatus();
			return true;
		}
		return false;
	},
};

// ==============================================
// Global Event Handlers
// ==============================================

App.Events = {
	init() {
		this.setupGlobalHandlers();
		this.setupIntersectionObserver();
		this.setupResizeHandler();
	},

	// Global Event Handlers
	setupGlobalHandlers() {
		// Click outside handlers
		document.addEventListener("click", this.handleOutsideClicks.bind(this));

		// Keyboard handlers
		document.addEventListener("keydown", this.handleKeyPress.bind(this));

		// Network status handlers
		window.addEventListener("online", this.handleOnline.bind(this));
		window.addEventListener("offline", this.handleOffline.bind(this));
	},

	handleOutsideClicks(e) {
		// Store options click handler
		if (!document.getElementById("shops").contains(e.target)) {
			App.State.toggleStoreOptions(false);
		}
	},

	handleKeyPress(e) {
		if (e.key === "Escape") {
			// Close store options if open
			if (App.State.current.isStoreOptionsVisible) {
				App.State.toggleStoreOptions(false);
			}
			// Close expanded category if any
			if (App.State.current.expandedCategory) {
				App.State.setExpandedCategory(null);
			}
		}
	},

	handleOnline() {
		if (App.State.current.selectedStore) {
			App.Data.refreshWeeklySpecials(App.State.current.selectedStore);
		}
		App.UI.Notifications.showToast("Connection restored");
	},

	handleOffline() {
		App.UI.Notifications.showToast("No internet connection");
	},

	// Intersection Observer
	setupIntersectionObserver() {
		const observerOptions = {
			root: null,
			rootMargin: "50px",
			threshold: 0.1,
		};

		const observer = new IntersectionObserver(
			this.handleIntersection.bind(this),
			observerOptions
		);

		document
			.querySelectorAll(".strain-card")
			.forEach((card) => observer.observe(card));
	},

	handleIntersection(entries) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("fade-in");

				const img = entry.target.querySelector("img[data-src]");
				if (img) {
					img.src = img.dataset.src;
					img.removeAttribute("data-src");
				}
			}
		});
	},

	// Resize Handler
	setupResizeHandler() {
		window.addEventListener(
			"resize",
			this.debounce(this.handleResize.bind(this), 250)
		);
	},

	handleResize() {
		// Update mobile status
		document.body.classList.toggle("is-mobile", window.innerWidth < 768);

		// Update expanded sections height
		document.querySelectorAll(".category-section.h-auto").forEach((section) => {
			if (section.classList.contains("h-auto")) {
				section.style.height = `${section.scrollHeight}px`;
			}
		});
	},

	// Utility Methods
	debounce(func, wait) {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	},

	// Cleanup Method (for component unmounting or page changes)
	cleanup() {
		// Remove event listeners
		document.removeEventListener("click", this.handleOutsideClicks);
		document.removeEventListener("keydown", this.handleKeyPress);
		window.removeEventListener("resize", this.handleResize);
		window.removeEventListener("online", this.handleOnline);
		window.removeEventListener("offline", this.handleOffline);
	},
};

// ==============================================
// App Initialization
// ==============================================

document.addEventListener("DOMContentLoaded", () => {
	const initializeApp = async () => {
		try {
			console.log("🚀 Starting application initialization...");

			// Core initialization
			App.cacheElements();

			// Sequential module initialization
			await Promise.all([
				App.State.init(),
				App.UI.init(),
				App.Data.init(),
				App.Auth.init(),
				App.Events.init(),
			]);

			// Post-initialization tasks
			App.UI.Notifications.setupStyles();

			console.log("✅ Application initialized successfully");
		} catch (error) {
			console.error("❌ Initialization error:", error);
			App.handleInitError(error);
		}
	};

	// Start initialization
	initializeApp().catch((error) => {
		console.error("💥 Fatal initialization error:", error);
		App.handleInitError(error);
	});
});

// Cleanup on page unload
window.addEventListener("unload", () => {
	App.Events.cleanup();
});
