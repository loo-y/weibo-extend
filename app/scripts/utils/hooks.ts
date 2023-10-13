import _ from 'lodash'

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
                                // if (source) {
                                //     console.log(`idstr`, source);
                                //     dataItem.originalSource = source
                                //     dataItem.source = `${source}, cid-${idstr}`
                                // }
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

// 劫持 XHR 调用 Send
export const hookXHRSend = () => {
    // 劫持 XHR 调用
    // 保存原始的 XMLHttpRequest 构造函数
    const originalXHR = window.XMLHttpRequest

    // 替换 XMLHttpRequest 构造函数
    // @ts-ignore
    window.XMLHttpRequest = function (...args) {
        // @ts-ignore
        let xhr = new (Function.prototype.bind.apply(originalXHR, args))()

        // 保存原始的 send 方法
        var originalSend = xhr.send

        // 重写 send 方法
        // @ts-ignore
        xhr.send = function (...sendArgs) {
            var originalOnReadyStateChange = xhr.onreadystatechange
            xhr.onreadystatechange = function () {
                // 检查状态码是否为 4 (完成)
                if (xhr.readyState === 4) {
                    // 检查状态码是否为 200
                    if (xhr.status === 200) {
                        // 检查当前请求的 URL 是否与目标 URL 匹配
                        if (xhr.responseURL.includes(`buildComments`)) {
                            console.log(`xhr.data`, xhr.data)
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
                        }
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