document.addEventListener("DOMContentLoaded", function () {
  // 1. Inject Header HTML
  const headerContainer =
    document.querySelector(".header.wf-section") || createHeaderContainer();

  // Check if we are on the home page to add w--current class
  const path = window.location.pathname;
  const isHome = path.endsWith("index.html") || path === "/";
  const isAbout = path.endsWith("about.html");

  // Check for project name in data attribute
  const projectName = headerContainer.getAttribute("data-project-name");

  let leftContent = "";
  let centerContent = "";
  let rightContent = "";

  // Toggles (Dark Mode + Chaos)
  // Note: 'chaos-mode' class is the Chaos Mode.
  // 'dark-mode' class (with hyphen) is the new Dark Mode.

  const darkModeToggle = `
      <button id="theme-toggle-btn" style="background: none; border: none; cursor: pointer; padding: 5px; color: inherit; margin-right: 5px;" title="Toggle Theme">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
      </button>
  `;

  const chaosToggle = `
      <div class="chaosorder">
        <div class="coselectorwrap">
          <div class="theblackcircle"></div>
        </div>
        <div class="cotext">chaos</div>
        <button id="chaos-toggle-btn" class="chaos-toggle-overlay w-button"></button>
      </div>
  `;

  if (isAbout) {
    // About Page Layout
    leftContent = `<a href="index.html" class="link">&#60;-BACK</a>`;
    centerContent = `<a href="#" class="link projectname">ABOUT</a>`;
    rightContent = `
            <div style="display: flex; align-items: center;">
                ${darkModeToggle}
                <a href="files/isaque_cv.pdf" target="_blank" download class="about-header-btn" style="padding: 5px 7px; margin-right: 5px;">cv ↓</a>
                ${chaosToggle}
            </div>
        `;
  } else {
    // Home & Project Page Layout
    const homeClass = isHome ? "link w--current" : "link";
    leftContent = `<a href="index.html" aria-current="page" style="margin-right: 5px; text-wrap: pretty;" class="${homeClass}">ISAQUE<br />SENEDA</a>`;

    if (projectName) {
      centerContent = `<a href="#" class="link projectname">${projectName}</a>`;
    }

    rightContent = `
            <div style="display: flex; align-items: center;">
                ${darkModeToggle}
                <a href="about.html" class="about-header-btn" style="padding: 5px 7px; margin-right: 5px;">about</a>
                ${chaosToggle}
            </div>
        `;
  }

  headerContainer.innerHTML = `
      <img
        id="isaac-img"
        src="images/cv-mini.png"
        style="
          margin: 20px;
          z-index: 99;
          border: 1px solid black;
          height: 150px;
          width: 200px;
          display: none;
          position: absolute;
        "
      />

      <div class="inheadertitlebox">
        <div style="display: flex; align-items: center;">
            ${leftContent}
        </div>
        
        <div style="display: flex; align-items: center; justify-content: center;">
            ${centerContent}
        </div>
        
        ${rightContent}
      </div>
      <div class="headerplaceholder"></div>
    `;

  // 2. Handle Dark Mode Logic
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const html = document.documentElement;

  // Check localStorage or System Preference
  const currentTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  if (currentTheme === "dark" || (!currentTheme && systemPrefersDark.matches)) {
    html.classList.add("dark-mode");
  }

  // Listen for System Preference Changes
  systemPrefersDark.addEventListener("change", (e) => {
    if (e.matches) {
      html.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });

  // Toggle Event
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      html.classList.toggle("dark-mode");

      if (html.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    });
  }

  // 3. Handle Chaos Toggle
  const chaosBtn = document.getElementById("chaos-toggle-btn");
  const chaosAudio = new Audio("audio/chaos.mp3");
  chaosAudio.loop = true;

  // Helper Functions for Chaos Mode
  function distortElements() {
    const allElements = document.querySelectorAll("*");

    // Centralized Distortion Intensity (0.0 to 1.0)
    // Adjust this value to control the strength of the chaos effect.
    const distortionIntensity = 5;

    const ratio = Math.min(1, (window.innerWidth - 300) / 4200); // Responsiveness ratio

    allElements.forEach((el) => {
      let currentIntensity = distortionIntensity;

      // 1. Mild Distortion for Structural Elements (5% of main intensity)
      if (
        el.matches &&
        el.matches(
          ".theproject, .thesection, .introsection, .cv-wrapper, .cv-body, .cv-side"
        )
      ) {
        currentIntensity = distortionIntensity * 0.05;
      } else {
        // 2. Exclusions for other elements
        if (
          el.tagName === "HTML" ||
          el.tagName === "BODY" ||
          el.classList.contains("header") ||
          el.classList.contains("inheadertitlebox") ||
          // Exclude contents of header
          el.closest(".header")
        ) {
          return;
        }
      }

      // Calculate ranges based on intensity
      // Max Skew: +/- 10 degrees at full intensity
      // Max Scale: +/- 4% at full intensity
      const maxSkew = 10 * currentIntensity;
      const maxScale = 0.04 * currentIntensity;

      const skewX = (Math.random() * (maxSkew * 2) - maxSkew) * ratio;
      const skewY = (Math.random() * (maxSkew * 2) - maxSkew) * ratio;
      const scaleX = 1 + (Math.random() * (maxScale * 2) - maxScale);
      const scaleY = 1 + (Math.random() * (maxScale * 2) - maxScale);

      el.style.transform = `skew(${skewX}deg, ${skewY}deg) scale(${scaleX}, ${scaleY})`;
      el.style.overflow = "hidden";
    });
  }
  function revertElements() {
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      // Same exclusions to be safe, though clearing transform on everything is usually fine
      // unless there are other transforms. For now, let's clear everything that might have been distorted.
      if (el.style.transform.includes("skew")) {
        el.style.transform = "";
        el.style.overflow = "";
      }
    });
  }

  function skewBackground() {
    if (window.innerWidth >= 500) {
      const skewX = Math.random() * 20 + 70;
      const skewY = Math.random() * 5 + 10;
      document.documentElement.style.setProperty("--bg-skew-x", `${skewX}deg`);
      document.documentElement.style.setProperty("--bg-skew-y", `${skewY}deg`);
      document.body.classList.add("background-active");
    }
  }

  function enableChaosMode() {
    document.body.classList.add("chaos-mode");
    localStorage.setItem("chaosMode", "enabled");
    document.body.style.overflow = "hidden";

    // Play Audio
    // Note: Browsers might block autoplay if not triggered by user interaction.
    // Since this is called on click, it should be fine.
    // On load, it might be blocked.
    chaosAudio.play().catch((e) => console.log("Audio play failed:", e));

    distortElements();
    skewBackground();
  }

  function disableChaosMode() {
    document.body.classList.remove("chaos-mode");
    document.body.classList.remove("background-active");
    localStorage.setItem("chaosMode", "disabled");
    document.body.style.overflow = "";

    chaosAudio.pause();
    chaosAudio.currentTime = 0;

    revertElements();
  }

  // Initialize Chaos Mode from LocalStorage
  const savedChaosMode = localStorage.getItem("chaosMode");
  if (savedChaosMode === "enabled") {
    // We can't auto-play audio reliably on load without interaction,
    // but we can apply visual effects.
    document.body.classList.add("chaos-mode");
    document.body.style.overflow = "hidden";
    distortElements();
    skewBackground();
    // Try to play audio, might fail
    chaosAudio.play().catch(() => {
      // If autoplay fails, maybe add a one-time click listener to body to start it?
      // Or just leave it silent until toggled off/on.
      console.log("Autoplay blocked - waiting for interaction");
    });
  }

  if (chaosBtn) {
    chaosBtn.addEventListener("click", function () {
      const isChaosEnabled = document.body.classList.contains("chaos-mode");
      if (isChaosEnabled) {
        disableChaosMode();
      } else {
        enableChaosMode();
      }
    });
  }
});

function createHeaderContainer() {
  const div = document.createElement("div");
  div.className = "header wf-section";
  document.body.insertBefore(div, document.body.firstChild);
  return div;
}
