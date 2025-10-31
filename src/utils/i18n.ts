import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

const numberFormats: any = {
    'ru-RU': {
        currency: {
            style: 'currency',
            currency: 'USD',
            notation: 'standard',
        },
        decimal: {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        },
        percent: {
            style: 'percent',
            useGrouping: false,
        },
    },
}

export const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || 'uz',
    fallbackLocale: 'ru',
    globalInjection: true,
    messages,
    numberFormats,
})

export async function setLocale(locale: string) {
    if (!i18n.global.availableLocales.includes(locale)) {
        const messages = await loadLocale(locale)

        if (!messages) return

        i18n.global.setLocaleMessage(locale, messages)
    }

    i18n.global.locale.value = locale
    localStorage.setItem('lang', locale)
}

function loadLocale(locale: string) {
    return fetch(`/assets/locales/${locale}.json`)
        .then((response) => {
            if (response.ok) {
                return response.json()
            }
            throw new Error(`Til faylini yuklab bo‘lmadi: ${locale}`)
        })
        .catch((error) => {
            console.error(error)
        })
}
