import store from '../reactVirtual/store'
import { updateShowRemoveFansBlock, updateshowBlockOtherFansBlock } from '../reactVirtual/slice'

const fansContent = () => {
    store.dispatch(updateShowRemoveFansBlock(false))
    store.dispatch(updateshowBlockOtherFansBlock(false))
    const currentUrl = document.location.href
    console.log(`run fans`, currentUrl)
    if (currentUrl.includes(`relate=fans`)) {
        store.dispatch(updateShowRemoveFansBlock(true))
        store.dispatch(updateshowBlockOtherFansBlock(true))
        return
    }
}

export default fansContent
