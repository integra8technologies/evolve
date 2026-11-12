
// MOBILE NAVIGATION

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
    });
});

document.addEventListener("click", event => {
    if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {
        navLinks.classList.remove("open");
    }
});


// SCROLL REVEAL ANIMATIONS

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealElements.forEach(element => observer.observe(element));
} else {
    revealElements.forEach(element => element.classList.add("visible"));
}


// SCREENSHOT SWITCHER

const screenshotData = {
    laptop: {
        image: "images/laptop.png",
        title: "Desktop experience",
        description: "Manage your products and sales through the full desktop interface.",
        alt: "QuickMart desktop interface",
        counter: "01 / 03"
    },

    tablet: {
        image: "images/tablet.png",
        title: "Tablet experience",
        description: "Access your point of sale interface through a tablet.",
        alt: "QuickMart tablet interface",
        counter: "02 / 03"
    },

    mobile: {
        image: "images/mobile.png",
        title: "Mobile experience",
        description: "Manage your business using a mobile-friendly interface.",
        alt: "QuickMart mobile interface",
        counter: "03 / 03"
    }
};

const screenshotImage = document.getElementById("screenshotImage");
const screenshotTitle = document.getElementById("screenshotTitle");
const screenshotDescription = document.getElementById("screenshotDescription");
const screenshotCounter = document.getElementById("screenshotCounter");

const screenshotTabs = document.querySelectorAll(".screenshot-tab");

screenshotTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const selectedScreen = tab.dataset.screen;
        const data = screenshotData[selectedScreen];

        if (!data) return;

        screenshotTabs.forEach(button => {
            button.classList.remove("active");
        });

        tab.classList.add("active");

        screenshotImage.classList.add("changing");

        setTimeout(() => {
            screenshotImage.src = data.image;
            screenshotImage.alt = data.alt;

            screenshotTitle.textContent = data.title;
            screenshotDescription.textContent = data.description;
            screenshotCounter.textContent = data.counter;

            screenshotImage.classList.remove("changing");
        }, 180);
    });
});


// CURRENT YEAR

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


// SUBSCRIPTION BUTTON INTERACTIONS

document.querySelectorAll(".plan-button").forEach(button => {
    button.addEventListener("click", () => {
        const selectedPlan = button.classList.contains("plan-button-primary")
            ? "Annual Plan"
            : "Monthly Plan";

        // Frontend demonstration only.
        // Connect this action to your actual registration/subscription
        // flow when integrating the PHP backend.

        console.log("Selected subscription:", selectedPlan);
    });
});
