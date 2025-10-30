import { nextTick } from 'vue'
import type { App } from 'vue'
import * as elIcons from '@element-plus/icons-vue'
import router from '@/router/index'
import Icon from '@/components/icon/index.vue'

export function registerIcons(app: App) {
    app.component('Icon', Icon)

    const icons = elIcons as any
    for (const i in icons) {
        app.component(`el-icon-${icons[i].name}`, icons[i])
    }
}

export function loadCss(url: string): void {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.crossOrigin = 'anonymous'
    document.getElementsByTagName('head')[0].appendChild(link)
}

export function loadJs(url: string): void {
    let link = document.createElement('script')
    link.src = url
    document.body.appendChild(link)
}
/**
 * @param {string} path
 * @return {Boolean}
 */
export function isExternal(path: string) {
    return /^(https?|ftp|mailto|tel):/.test(path)
}
