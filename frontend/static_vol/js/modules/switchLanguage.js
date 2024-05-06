"use strict";

const switchLanguage = (language) => {
    const languageSelect = document.getElementById("languageSelect");

    // 言語が変更されたときの処理
    languageSelect.addEventListener("change", () => {
        const selectedLanguage = languageSelect.value;
        console.log("!selectedLanguage! " + selectedLanguage);
        localStorage.setItem("configLang", selectedLanguage);
    });
}

export { switchLanguage };