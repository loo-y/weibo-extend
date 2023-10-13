// @ts-ignore
import $ from 'jquery'
// @ts-ignore
import Cookies from 'js-cookie'

function injectCustomScript() {
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

// injectCustomScript()

const contentRun = async () => {
    // watchElement({
    //     targetSelector: '.wbpro-list',
    //     handleTarget: element => {
    //         console.log(`target node`, element)
    //     },
    // })

    $(document).on('mouseover', '.wbpro-list', (event: $.Event) => {
        const targetElement = event.currentTarget as HTMLElement
        console.log(`$(targetElement)`, targetElement)

        const item1 = $(targetElement).find('.item1')
        const item2List = $(targetElement).find('.item2')
        const item1IconBox = item1.find(`.opt.woo-box-flex`)
        if (item1IconBox.find('.weibo-extend-black').length < 1) {
            const weiboExtendBlackBtn = $(`<div>`)
                .text('拉黑此条点赞的所有人')
                .addClass(
                    'weibo-extend-black wbpro-iconbed woo-box-flex woo-box-alignCenter woo-box-justifyCenter optHover'
                )
                .prependTo(item1IconBox)
            weiboExtendBlackBtn.click(() => {
                fetch('https://weibo.com/ajax/statuses/filterUser', {
                    headers: {
                        accept: 'application/json, text/plain, */*',
                        'x-requested-with': 'XMLHttpRequest',
                        'x-xsrf-token': globalThis.xsrfToken,
                        // "client-version": "v2.43.44",
                        'content-type': 'application/json;charset=UTF-8',
                    },
                    body: '{"uid":6408587650,"status":0,"interact":0,"follow":0}',
                    method: 'POST',
                })
            })
        }
    })
}
window.addEventListener('load', () => {
    const xsrfToken = Cookies.get(`XSRF-TOKEN`)
    globalThis.xsrfToken = xsrfToken
    contentRun()
    console.log(`Cookies,`)
})

const watchElement = ({
    targetSelector,
    handleTarget,
}: {
    targetSelector: string
    handleTarget: (element: any) => void
}) => {
    if (!targetSelector) return

    // 创建一个 MutationObserver 实例
    const observer = new MutationObserver((mutationsList, observer) => {
        // 遍历每个变化记录
        for (let mutation of mutationsList) {
            // 检查添加的节点是否匹配目标选择器
            if (mutation.addedNodes) {
                // @ts-ignore
                for (let node of mutation.addedNodes) {
                    if (
                        node.matches &&
                        (node.matches(targetSelector) || node.querySelectorAll(targetSelector)?.length)
                    ) {
                        // 目标元素出现
                        handleTarget(node)
                    }
                }
            }
        }
    })

    // 监听整个文档的变化
    observer.observe(document, { childList: true, subtree: true })
}

// 监听页面的加载完成事件, 注入自定义脚本到页面中
// window.addEventListener('load', injectCustomScript)
