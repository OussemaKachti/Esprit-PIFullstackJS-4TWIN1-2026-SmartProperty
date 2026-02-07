// Apply the saved theme settings from local storage
document.querySelector("html").setAttribute("data-theme", localStorage.getItem('theme') || 'light');
    
document.addEventListener("DOMContentLoaded", function () {
    // Ensure themesettings is defined before inserting
    if (typeof themesettings !== "undefined" && themesettings) {
        document.body.insertAdjacentHTML("beforeend", themesettings);
    }

    // Get the HTML element and toggle buttons
    const htmlElement = document.documentElement;
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const lightModeToggle = document.getElementById("light-mode-toggle");

    let darkMode;
    try {
        darkMode = localStorage.getItem("darkMode");
    } catch (e) {
        console.warn("LocalStorage is not accessible:", e);
    }

    // Function to enable dark mode
    function enableDarkMode() {
        htmlElement.setAttribute("data-theme", "dark");
        try {
            localStorage.setItem("darkMode", "enabled");
        } catch (e) {
            console.warn("Failed to save to LocalStorage:", e);
        }

        if (darkModeToggle) darkModeToggle.classList.add("active");
        if (lightModeToggle) lightModeToggle.classList.remove("active");
    }

    // Function to disable dark mode
    function disableDarkMode() {
        htmlElement.setAttribute("data-theme", "light");
        try {
            localStorage.setItem("darkMode", "disabled");
        } catch (e) {
            console.warn("Failed to save to LocalStorage:", e);
        }

        if (lightModeToggle) lightModeToggle.classList.add("active");
        if (darkModeToggle) darkModeToggle.classList.remove("active");
    }

    // Apply the correct theme immediately on page load
    if (darkMode === "enabled") {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    // Add event listeners only if buttons exist
    if (darkModeToggle) darkModeToggle.addEventListener("click", enableDarkMode);
    if (lightModeToggle) lightModeToggle.addEventListener("click", disableDarkMode);
});
