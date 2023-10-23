import _ from 'lodash'
import { POST_MSG_TYPE } from './interface'
interface IHookXHRProps {
    responseReplaceList: { urlMatch: string; responseModify: (responseText: string) => string }[]

    requestReplaceList?: { urlMatch: string; requestModify?: Record<string, any>; isBlock?: boolean }[]
}
// 劫持 XHR 调用 Send
export const hookXHR = ({ responseReplaceList, requestReplaceList }: IHookXHRProps) => {
    if (_.isEmpty(responseReplaceList)) return
    // 劫持 XHR 调用
    // 保存原始的 XMLHttpRequest 构造函数
    const originalXHR = window.XMLHttpRequest

    // 替换 XMLHttpRequest 构造函数
    // @ts-ignore
    window.XMLHttpRequest = function (...args) {
        // @ts-ignore
        let xhr = new (Function.prototype.bind.apply(originalXHR, args))()

        // ********** open 用于劫持 request **********

        // 保存原始的 open 方法
        var originalOpen = xhr.open
        // 重写 open 方法
        // @ts-ignore
        xhr.open = function (method, url, async) {
            let isBlock = false
            isBlock = _.some(requestReplaceList, requestReplaceItem => {
                return requestReplaceItem?.isBlock == true && url?.includes(requestReplaceItem.urlMatch)
            })

            if (isBlock) {
                const virtualXhr = new XMLHttpRequest()
                Object.defineProperty(virtualXhr, 'readyState', {
                    writable: true,
                })
                Object.defineProperty(virtualXhr, 'status', {
                    writable: true,
                })
                Object.defineProperty(virtualXhr, 'statusText', {
                    writable: true,
                })
                Object.defineProperty(virtualXhr, 'responseText', {
                    writable: true,
                })

                // 设置虚拟的响应结果
                const responseText = `{"ok":1}`
                const status = 200
                const statusText = 'OK'

                // 模拟 readyState 的变化
                // @ts-ignore
                virtualXhr.readyState = 4
                // @ts-ignore
                virtualXhr.status = status
                // @ts-ignore
                virtualXhr.statusText = statusText
                // @ts-ignore
                virtualXhr.responseText = responseText

                // 调用原始的 onreadystatechange 事件处理程序，以触发原本的回调函数
                // this.onreadystatechange && this.onreadystatechange();

                originalOpen.call(xhr, 'GET', `//${location.host}/`, true)
                // 返回虚拟的 XMLHttpRequest 对象
                // return virtualXhr.open(method, '', async);
            } else {
                // 调用原始的 open 方法
                originalOpen.call(xhr, method, url, async)
            }
        }

        // ********** send 用于劫持 response **********

        // 保存原始的 send 方法
        let originalSend = xhr.send

        // 重写 send 方法
        // @ts-ignore
        xhr.send = function (...sendArgs) {
            let originalOnReadyStateChange = xhr.onreadystatechange
            xhr.onreadystatechange = function () {
                // 检查状态码是否为 4 (完成)
                if (xhr.readyState === 4) {
                    // 检查状态码是否为 200
                    if (xhr.status === 200) {
                        _.each(responseReplaceList, ({ urlMatch, responseModify }) => {
                            // 检查当前请求的 URL 是否与目标 URL 匹配
                            if (xhr.responseURL.includes(urlMatch)) {
                                console.log(`xhr.data`, xhr.data)
                                // 替换返回内容
                                const responseText = xhr.responseText
                                Object.defineProperty(xhr, 'responseText', {
                                    writable: true,
                                })
                                xhr.responseText = responseModify(responseText)
                            }
                        })
                    } else {
                        // 处理其他状态码的情况
                        console.log('请求失败，状态码：' + xhr.status)
                    }
                }

                // 调用原始的 onreadystatechange 方法
                if (originalOnReadyStateChange) {
                    originalOnReadyStateChange.call(xhr)
                }
            }

            // 调用原始的 send 方法
            originalSend.apply(xhr, sendArgs)
        }
        return xhr
    }
}

export const hookHistory = (history: History) => {
    var originalPushState = history.pushState

    history.pushState = function (state, title, url) {
        if (typeof history.onpushstate == 'function') {
            history.onpushstate({ state: state })
        }

        // post url change
        const urlString: string = url as string
        window.postMessage({ action: POST_MSG_TYPE.historyChagne, url: urlString }, '*')

        // TODO 某些情况下， url 是一个相对路径
        // @ts-ignore
        // url = url && url.search(/^http/) > -1 ? url : ''

        // 调用原生的 history.pushState 方法
        // @ts-ignore
        return originalPushState.apply(history, arguments)
    }
    console.log(history.pushState)
}

// 劫持 XHR 调用 Open
export const hookXHROpen = () => {
    // 劫持 XHR 调用
    // 保存原始的 XMLHttpRequest 构造函数
    const originalXHR = window.XMLHttpRequest

    // 替换 XMLHttpRequest 构造函数
    // @ts-ignore
    window.XMLHttpRequest = function (...args) {
        // @ts-ignore
        let xhr = new (Function.prototype.bind.apply(originalXHR, args))()

        // 保存原始的 open 方法
        var originalOpen = xhr.open
        // 重写 open 方法
        // @ts-ignore
        xhr.open = function (method, url, async) {
            // 检查接口名是否为 "gettest"
            if ((url as string).indexOf('buildComments') !== -1) {
                // 保存原始的 onload 方法
                var originalOnLoad = xhr.onload

                // 重写 onload 方法
                // @ts-ignore
                xhr.onload = function (...loadargs) {
                    // 检查状态码是否为 200
                    if (xhr.status === 200) {
                        // 替换返回内容
                        var responseText = xhr.responseText

                        let responseJson = JSON.parse(responseText)
                        console.log(`responseText`, responseJson, responseJson?.data?.length)
                        if (responseJson?.data?.length) {
                            responseJson.data = _.map(responseJson.data, dataItem => {
                                const { source = '', idstr } = dataItem || {}

                                return {
                                    ...dataItem,
                                    originalSource: source,
                                    source: `${source}, cid-${idstr}`,
                                }
                            })
                            console.log(`responseJson.data`, responseJson.data)
                        }
                        Object.defineProperty(xhr, 'responseText', {
                            writable: true,
                        })
                        xhr.responseText = JSON.stringify(responseJson)
                    } else {
                        // 处理其他状态码的情况
                        console.log('请求失败，状态码：' + xhr.status)
                    }

                    // 调用原始的 onload 方法
                    if (originalOnLoad) {
                        originalOnLoad.apply(this, loadargs)
                    }
                }
            }

            // 调用原始的 open 方法
            originalOpen.call(xhr, method, url, async)
        }

        return xhr
    }
}
