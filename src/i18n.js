import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

let i18n;

export const SUPPORT_LOCALES = ['en', 'fr'];

/**
 * Change the current locale and save the preference to the local storage
 * @param {string} locale 
 */
export const setI18nLanguage = (locale) => {
    loadLocaleMessages(locale);

    if (i18n.mode === 'legacy') {
        i18n.global.locale = locale;
    } else {
        i18n.global.locale.value = locale;
    }

    document.querySelector('html').setAttribute('lang', locale);
    localStorage.setItem('lang', locale);
}


/**
 * Find the preferred language from the local storage or the browser
 * @returns {string} The preferred language
 */
export const getPreferredLanguage = () => {
    const browserLanguage = navigator.language.split('-')[0];
    const locale = localStorage.getItem('lang') || browserLanguage;
    if (new Set(["en", "fr"]).has(locale)) {
        return locale
    } else {
        return "en"
    }
}


/** 
 * Load and set locale messages with dynamic import
 * @param {string} locale
 * @returns {Promise<void>}
 */
const loadLocaleMessages = async (locale) => {
    // 
    const messages = await import(
        `./locales/${locale}.json`
    );

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages.default);

    return nextTick();
}

/**
 * Return the i18n instance so translations can be used by components
 * Setup the i18n instance 
 **/
export default function setupI18n() {
    if (!i18n) {
        const locale = getPreferredLanguage()
        i18n = createI18n({
            globalInjection: true,
            legacy: false,
            locale: locale,
            fallbackLocale: locale
        });


        setI18nLanguage(locale);
    }
    return i18n;
}