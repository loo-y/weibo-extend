import _ from 'lodash'
import { hookXHRSend } from '../utils/hooks'

const injectFunction = () => {
    // hookXHR()
    hookXHRSend({
        responseReplaceList: [
            {
                urlMatch: `buildComment`,
                responseModify: responseText => {
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
                    return JSON.stringify(responseJson)
                },
            },
            {
                urlMatch: `profile/info`,
                responseModify: responseText => {
                    let responseJson = JSON.parse(responseText)
                    console.log(`profile/info responseText`, responseJson, responseJson?.data?.length)
                    if (!_.isEmpty(responseJson?.data)) {
                        responseJson.data = {
                            ...responseJson.data,
                            origin_block_me: responseJson.data.block_me,
                            block_me: undefined,
                            blockText: '',
                            tabList: [
                                {
                                    name: 'home',
                                    tabName: '精选',
                                },
                                {
                                    name: 'feed',
                                    tabName: '微博',
                                },
                                {
                                    name: 'newVideo',
                                    tabName: '视频',
                                },
                                {
                                    name: 'album',
                                    tabName: '相册',
                                },
                                {
                                    name: 'article',
                                    tabName: '文章',
                                },
                            ],
                        }
                        console.log(`responseJson.data`, responseJson.data)
                    }
                    return JSON.stringify(responseJson)
                },
            },
        ],
    })
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
