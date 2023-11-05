import store from '../reactVirtual/store'
import { updateShowRemoveFansBlock, updateshowBlockOtherFansBlock, downloadPost } from '../reactVirtual/slice'

const fansContent = () => {
    store.dispatch(updateShowRemoveFansBlock(false))
    store.dispatch(updateshowBlockOtherFansBlock(false))
    const currentUrl = new URL(document.location.href)
    const urlPath = currentUrl.pathname || window.location.pathname
    const searchParams = new URLSearchParams(currentUrl.search)
    console.log(`run fans`, currentUrl)
    if (searchParams.get(`relate`) == `fans`) {
        store.dispatch(updateShowRemoveFansBlock(true))
        store.dispatch(updateshowBlockOtherFansBlock(true))
        return
    }
    if (searchParams.get(`weiboextend`)?.toLowerCase() == `downloadpost`) {
        const matchedValues = urlPath.match(/(\d+)\/(\S+)/) || []
        const [fullPath, uid = '', mblogId = ''] = matchedValues
        store.dispatch(
            downloadPost({
                uid,
                mblogId,
            })
        )
        return
    }
}

export default fansContent
