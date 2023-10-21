// @ts-ignore
import $ from 'jquery'
import _ from 'lodash'
// @ts-ignore
import Cookies from 'js-cookie'
import { fetchToGetLikeUsers } from '../utils/fetches'
import { weiboExtendClassNames, weiboExtendVirtualRootId } from '../utils/constants'
import { updateBlackUserList, updateBlackLikeText } from '../reactVirtual/slice'
import { injectVirtualRoot, injectVirtualStyle } from './injects'
import store from '../reactVirtual/store'
import { POST_MSG_TYPE } from '../utils/interface'
import fansContent from './fansContent'

const contentRun = async () => {
    console.log(`this is contentRun`)

    fansContent()

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

// 监听页面的加载完成事件, 注入自定义脚本到页面中
window.addEventListener('load', () => {
    const xsrfToken = Cookies.get(`XSRF-TOKEN`)
    globalThis.xsrfToken = xsrfToken

    injectVirtualRoot()
    injectVirtualStyle()

    contentRun()
})

window.addEventListener('message', function (event) {
    if (event.source === window && event.data.action === POST_MSG_TYPE.historyChagne) {
        console.log(event.data.action, event.data.url, document.location.href)
        fansContent()
    }
})
