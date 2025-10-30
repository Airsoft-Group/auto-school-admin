import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { registerIcons } from '@/utils/common'
import ElementPlus from 'element-plus'
import mitt from 'mitt'
import { i18n } from './utils/i18n'
import 'element-plus/dist/index.css'
import '@/assets/styles/base.scss'
import '@/assets/styles/element/index.scss'

import VueTheMask from 'vue-the-mask';
import type { Plugin } from 'vue';
async function start() {
    const app = createApp(App)

    registerIcons(app)
    // const i18n = await loadLang(app)

    app.use(router)
    app.use(i18n)
    app.use(ElementPlus, {
        // locale: elementEnLocale,
    })


    app.use(createPinia())
    app.use(VueTheMask as unknown as Plugin);
    app.mount('#app')
    app.config.globalProperties.eventBus = mitt()
}
start()
