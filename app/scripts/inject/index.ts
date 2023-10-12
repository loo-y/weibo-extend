import { hookXHR, hookXHRSend } from '../utils/hooks'

const injectFunction = () => {
    // hookXHR()
    hookXHRSend()
}

injectFunction()
;(function (history) {
    var originalPushState = history.pushState

    history.pushState = function (state, title, url) {
        if (typeof history.onpushstate == 'function') {
            history.onpushstate({ state: state })
        }

        // @ts-ignore
        url = url && url.search(/^http/) > -1 ? url : ''

        // 调用原生的 history.pushState 方法
        // @ts-ignore
        return originalPushState.apply(history, arguments)
    }
    console.log(history.pushState)
})(history)
