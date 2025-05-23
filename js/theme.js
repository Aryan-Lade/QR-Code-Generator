import { getStorage } from "./storage.js";

const THEME_KEY = "qrstudio-theme";

function getPreferredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = getStorage().getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  getStorage().setItem(THEME_KEY, theme);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    const icon = toggle.querySelector("i");
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    if (icon) {
      icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
  }
}

export function initTheme() {
  applyTheme(getPreferredTheme());

  const toggle = document.getElementById("themeToggle");
  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.body.classList.add("theme-transition");
    applyTheme(nextTheme);
    window.setTimeout(() => document.body.classList.remove("theme-transition"), 180);
  });
}

export function getCurrentTheme() {
  return document.documentElement.dataset.theme || getPreferredTheme();
}

export function setTheme(theme) {
  applyTheme(theme === "dark" ? "dark" : "light");
}
