// @ts-ignore
import $ from 'jquery'
import _ from 'lodash'
// @ts-ignore
import Cookies from 'js-cookie'
import { fetchToBlockUser, fetchToGetLikeUsers } from '../utils/fetches'
import { weiboExtendClassNames, weiboExtendVirtualRootId } from '../utils/constants'
import { showUserList } from '../utils/doms'
import { XShowUserListR } from '../utils/domsR'
import { updateBlackUserList, updateBlackLikeText } from '../reactVirtual/slice'
import { renderVirtualPage } from '../reactVirtual/virtualPage'
import store from '../reactVirtual/store'

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

const injectVirtualStyle = () => {
    // virtualPage.output.css
    var linkStyleElment = document.createElement('link')
    var extensionId = chrome.runtime.id
    linkStyleElment.href = `chrome-extension://${extensionId}/virtualPage.output.css`
    linkStyleElment.rel = `stylesheet`
    document.body?.appendChild(linkStyleElment)
}

const injectVirtualRoot = () => {
    var virtualRoot = document.createElement('div')
    virtualRoot.className = weiboExtendClassNames.root
    virtualRoot.id = weiboExtendVirtualRootId
    document.body.appendChild(virtualRoot)
    renderVirtualPage()
}

const contentRun = async () => {
    // console.log(`globalThis.xsrfToken`, globalThis.xsrfToken)
    const { base: WEC_base, blockLikeUsers: WEC_blockLikeUsers } = weiboExtendClassNames
    $(document).on('mouseover', '.wbpro-list', (event: $.Event) => {
        const targetElement = event.currentTarget as HTMLElement
        // console.log(`$(targetElement)`, targetElement)

        const item1 = $(targetElement).find('.item1')
        const item2List = $(targetElement).find('.item2')
        const item1In = item1.find(`.item1in`)
        const item1IconBox = item1In.find(`.opt.woo-box-flex`)
        if (item1IconBox.find(`.${WEC_blockLikeUsers}`).length < 1) {
            const commentIdDom = item1In.find(`.${weiboExtendClassNames.commentId}`)
            const commentText = commentIdDom?.parent()?.text() || ''
            const commentId = commentIdDom?.data('cid') || ''
            const weiboExtendBlackBtn = $(`<div>`)
                .text('点赞列表')
                .addClass(
                    `${WEC_base} ${WEC_blockLikeUsers} wbpro-iconbed woo-box-flex woo-box-alignCenter woo-box-justifyCenter optHover`
                )
                .css('width', '80px')
                .prependTo(item1IconBox)
            weiboExtendBlackBtn.click(async () => {
                const likeUsers = await fetchToGetLikeUsers({ commentId: commentId })
                console.log(`likeUsers`, likeUsers)
                // showUserList({
                //     userList: likeUsers?.userList,
                // })
                console.log(`commentText`, commentText)
                store.dispatch(updateBlackUserList({ blackUserList: likeUsers?.userList || [] }))
                store.dispatch(updateBlackLikeText({ blackLikeText: commentText }))
                // console.log(`showUserListR`, XShowUserListR({ userList: likeUsers?.userList || [] }))
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

// 监听页面的加载完成事件, 注入自定义脚本到页面中
window.addEventListener('load', () => {
    injectVirtualRoot()
    injectVirtualStyle()
})
