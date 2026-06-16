export const THEME_STORAGE_KEY = "site-theme-inverted";
export const THEME_ATTR = "data-theme";

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="inverted")document.documentElement.setAttribute("${THEME_ATTR}","inverted")}catch(e){}})();`;
