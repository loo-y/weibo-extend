import { weiboExtendClassNames, weiboExtendVirtualRootId } from '../utils/constants'
import { renderVirtualPage } from '../reactVirtual/virtualPage'

const injectCustomScript = () => {
    var scriptElement = document.createElement('script')
    var extensionId = chrome.runtime.id
    console.log(extensionId)
    scriptElement.src = `chrome-extension://${extensionId}/inject-script.js`
    // document.documentElement.appendChild(scriptElement)
    document.head?.appendChild(scriptElement)

    // 获取页面中所有的 <script> 元素
    const scriptElementsInPage = document.getElementsByTagName('script')
    const firstScriptElement = scriptElementsInPage[0]
    // 插入新的 <script> 元素到第一个 <script> 元素之前
    // firstScriptElement?.parentNode?.insertBefore(scriptElement, firstScriptElement)
}

export const injectVirtualStyle = () => {
    // virtualPage.output.css
    var linkStyleElment = document.createElement('link')
    var extensionId = chrome.runtime.id
    linkStyleElment.href = `chrome-extension://${extensionId}/virtualPage.output.css`
    linkStyleElment.rel = `stylesheet`
    document.body?.appendChild(linkStyleElment)
}

export const injectVirtualRoot = () => {
    var virtualRoot = document.createElement('div')
    virtualRoot.className = weiboExtendClassNames.root
    virtualRoot.id = weiboExtendVirtualRootId
    document.body.appendChild(virtualRoot)
    renderVirtualPage()
}
