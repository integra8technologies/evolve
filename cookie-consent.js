(function () {
    "use strict";

    const storageKey = "evolve-cookie-consent";
    const consentVersion = 1;
    const categories = ["analytics", "marketing"];
    let consent = readConsent();

    function readConsent() {
        try {
            const value = localStorage.getItem(storageKey);
            if (!value) return null;

            const saved = JSON.parse(value);
            if (
                saved.version !== consentVersion ||
                typeof saved.analytics !== "boolean" ||
                typeof saved.marketing !== "boolean"
            ) {
                console.warn("Cookie preferences were invalid or outdated; asking again.");
                return null;
            }

            return {
                necessary: true,
                analytics: saved.analytics,
                marketing: saved.marketing
            };
        } catch (error) {
            console.error("Unable to read saved cookie preferences.", error);
            return null;
        }
    }

    function storeConsent(nextConsent) {
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                version: consentVersion,
                analytics: nextConsent.analytics,
                marketing: nextConsent.marketing,
                updatedAt: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            console.error("Unable to save cookie preferences.", error);
            return false;
        }
    }

    function activateConsentedScripts() {
        document.querySelectorAll('script[type="text/plain"][data-consent-category]').forEach(function (blockedScript) {
            const category = blockedScript.dataset.consentCategory;
            if (!categories.includes(category) || !consent || !consent[category] || blockedScript.dataset.consentActivated) return;

            const activeScript = document.createElement("script");
            Array.from(blockedScript.attributes).forEach(function (attribute) {
                if (attribute.name !== "type" && attribute.name !== "data-consent-category" && attribute.name !== "data-consent-activated") {
                    activeScript.setAttribute(attribute.name, attribute.value);
                }
            });
            activeScript.textContent = blockedScript.textContent;
            blockedScript.dataset.consentActivated = "true";
            blockedScript.parentNode.insertBefore(activeScript, blockedScript.nextSibling);
        });
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    }

    const banner = createElement("section", "cookie-banner");
    banner.setAttribute("aria-labelledby", "cookie-banner-title");
    banner.innerHTML = `
        <div class="cookie-banner-copy">
            <p class="cookie-eyebrow">Your privacy</p>
            <h2 id="cookie-banner-title">Choose your cookie preferences</h2>
            <p>Essential storage keeps this site working and remembers your choice. Optional analytics and marketing scripts stay off unless you allow them.</p>
        </div>
        <div class="cookie-banner-actions">
            <button class="cookie-button cookie-button--quiet" type="button" data-cookie-action="reject">Reject optional</button>
            <button class="cookie-button cookie-button--quiet" type="button" data-cookie-action="customize">Customize</button>
            <button class="cookie-button cookie-button--primary" type="button" data-cookie-action="accept">Accept all</button>
        </div>
        <p class="cookie-error" role="alert" hidden>We couldn't save your choice in this browser. Please check your browser's storage settings and try again.</p>`;

    const preferences = document.createElement("dialog");
    preferences.className = "cookie-preferences";
    preferences.setAttribute("aria-labelledby", "cookie-preferences-title");
    preferences.innerHTML = `
        <div class="cookie-preferences-inner">
            <p class="cookie-eyebrow">Privacy controls</p>
            <h2 id="cookie-preferences-title">Cookie preferences</h2>
            <p class="cookie-preferences-intro">Choose which optional technologies this site may use. Essential storage is always on so the site can remember your settings.</p>
            <div class="cookie-category">
                <div><h3>Essential storage</h3><p>Required for core site features and to save your privacy preferences.</p></div>
                <label class="cookie-switch"><input type="checkbox" checked disabled aria-label="Essential storage is always on"><span aria-hidden="true"></span><span class="cookie-always-on">Always on</span></label>
            </div>
            <div class="cookie-category">
                <div><h3>Analytics</h3><p>Helps us understand how visitors use the site so we can improve it.</p></div>
                <label class="cookie-switch"><input type="checkbox" name="analytics"><span aria-hidden="true"></span><span class="visually-hidden">Allow analytics</span></label>
            </div>
            <div class="cookie-category">
                <div><h3>Marketing</h3><p>Allows marketing or advertising technologies to measure and personalize content.</p></div>
                <label class="cookie-switch"><input type="checkbox" name="marketing"><span aria-hidden="true"></span><span class="visually-hidden">Allow marketing</span></label>
            </div>
            <p class="cookie-error" role="alert" hidden>We couldn't save your choice in this browser. Please check your browser's storage settings and try again.</p>
            <div class="cookie-preferences-actions">
                <button class="cookie-button cookie-button--quiet" type="button" data-cookie-action="cancel">Cancel</button>
                <button class="cookie-button cookie-button--primary" type="button" data-cookie-action="save">Save my choices</button>
            </div>
        </div>`;

    document.body.append(banner, preferences);

    const footerInner = document.querySelector("footer .footer-inner");
    if (footerInner) {
        const settingsButton = createElement("button", "cookie-settings-trigger", "Cookie settings");
        settingsButton.type = "button";
        settingsButton.addEventListener("click", openPreferences);
        footerInner.append(settingsButton);
    }

    function showError(container) {
        const error = container.querySelector(".cookie-error");
        if (error) error.hidden = false;
    }

    function hideError(container) {
        const error = container.querySelector(".cookie-error");
        if (error) error.hidden = true;
    }

    function openPreferences() {
        preferences.querySelector('[name="analytics"]').checked = Boolean(consent && consent.analytics);
        preferences.querySelector('[name="marketing"]').checked = Boolean(consent && consent.marketing);
        hideError(preferences);
        if (typeof preferences.showModal === "function") {
            preferences.showModal();
        } else {
            preferences.setAttribute("open", "");
        }
    }

    function savePreferences(nextConsent) {
        hideError(banner);
        hideError(preferences);
        if (!storeConsent(nextConsent)) {
            showError(banner);
            showError(preferences);
            return;
        }

        const revokedOptionalConsent = consent && categories.some(function (category) {
            return consent[category] && !nextConsent[category];
        });
        consent = nextConsent;
        banner.hidden = true;
        if (preferences.open) preferences.close();
        window.dispatchEvent(new CustomEvent("evolveconsentchange", {
            detail: { ...consent }
        }));

        if (revokedOptionalConsent) {
            window.location.reload();
            return;
        }
        activateConsentedScripts();
    }

    banner.addEventListener("click", function (event) {
        const action = event.target.closest("[data-cookie-action]");
        if (!action) return;

        if (action.dataset.cookieAction === "accept") {
            savePreferences({ necessary: true, analytics: true, marketing: true });
        } else if (action.dataset.cookieAction === "reject") {
            savePreferences({ necessary: true, analytics: false, marketing: false });
        } else if (action.dataset.cookieAction === "customize") {
            openPreferences();
        }
    });

    preferences.addEventListener("click", function (event) {
        const action = event.target.closest("[data-cookie-action]");
        if (!action) return;

        if (action.dataset.cookieAction === "save") {
            savePreferences({
                necessary: true,
                analytics: preferences.querySelector('[name="analytics"]').checked,
                marketing: preferences.querySelector('[name="marketing"]').checked
            });
        } else if (action.dataset.cookieAction === "cancel") {
            preferences.close();
        }
    });

    window.evolveCookieConsent = {
        getConsent: function () {
            return consent ? { ...consent } : null;
        },
        hasConsent: function (category) {
            return category === "necessary" || Boolean(consent && consent[category] === true);
        },
        openPreferences: openPreferences,
        refreshScripts: activateConsentedScripts
    };

    if (consent) {
        banner.hidden = true;
        activateConsentedScripts();
    }
})();
