import store from '../reactVirtual/store'
import { updateShowRemoveFansBlock } from '../reactVirtual/slice'

const fansContent = () => {
    const currentUrl = document.location.href
    if (!currentUrl.includes(`relate=fans`)) {
        store.dispatch(updateShowRemoveFansBlock(false))
        return
    }

    // TODO WIP 未完成，隐藏
    store.dispatch(updateShowRemoveFansBlock(false))
    // store.dispatch(updateShowRemoveFansBlock(true))
}

export default fansContent
