import _ from 'lodash'
import { hookXHRSend, hookHistory } from '../utils/hooks'
import { homePageTabList } from '../utils/constants'
import { weiboExtendClassNames } from '../utils/constants'

const responseReplaceList = [
    {
        // 瀑布流 - 屏蔽广告
        urlMatch: `unreadfriendstimeline`,
        responseModify: (responseText: string) => {
            let responseJson: Record<string, any> = {}
            try {
                responseJson = JSON.parse(responseText)
                if (responseJson?.statuses?.length) {
                    responseJson.statuses = _.filter(responseJson.statuses, dataItem => {
                        const { promotion } = dataItem || {}
                        if (promotion?.type == `ad`) {
                            console.log(`ad==>`, dataItem)
                            return false
                        }
                        return true
                    })
                }
            } catch (e) {
                console.log(`error`, e)
            }
            return JSON.stringify(responseJson)
        },
    },
    {
        urlMatch: `buildComment`,
        responseModify: (responseText: string) => {
            let responseJson: Record<string, any> = {}
            try {
                responseJson = JSON.parse(responseText)
                console.log(`responseText`, responseJson, responseJson?.data?.length)
                if (responseJson?.data?.length) {
                    responseJson.data = _.map(responseJson.data, dataItem => {
                        const { source = '', text, idstr } = dataItem || {}

                        return {
                            ...dataItem,
                            originalSource: source,
                            // source: `${source}, <span>cid-${idstr}</span>`,
                            text: `${text}<span class="${weiboExtendClassNames.base} ${weiboExtendClassNames.commentId}" data-cid=${idstr}></span>`,
                        }
                    })
                }
            } catch (e) {
                console.log(`error`, e)
            }
            return JSON.stringify(responseJson)
        },
    },
    {
        urlMatch: `profile/info`,
        responseModify: (responseText: string) => {
            let responseJson: Record<string, any> = {}
            try {
                responseJson = JSON.parse(responseText)
                console.log(`profile/info responseText`, responseJson, responseJson?.data?.length)
                if (!_.isEmpty(responseJson?.data)) {
                    responseJson.data = {
                        ...responseJson.data,
                        origin_block_me: responseJson.data.block_me,
                        // block_me: undefined,
                        blockText: '',
                        tabList: homePageTabList,
                    }
                }
            } catch (e) {
                console.log(`error`, e)
            }

            return JSON.stringify(responseJson)
        },
    },
]
const injectFunction = () => {
    // hookXHR()
    hookXHRSend({
        responseReplaceList,
    })

    // TODO stop hook histroy, a pic opened cannot be close.
    // hookHistory(history)
}

injectFunction()
