import store from '../reactVirtual/store'
import { updateShowRemoveFansBlock } from '../reactVirtual/slice'

const fansContent = () => {
    const currentUrl = document.location.href
    if (!currentUrl.includes(`relate=fans`)) {
        store.dispatch(updateShowRemoveFansBlock(false))
        return
    }

    store.dispatch(updateShowRemoveFansBlock(true))
}

export default fansContent
