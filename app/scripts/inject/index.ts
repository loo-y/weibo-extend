import _ from 'lodash'
import { hookXHRSend, hookHistory } from '../utils/hooks'
import { homePageTabList } from '../utils/constants'

const responseReplaceList = [
    {
        urlMatch: `buildComment`,
        responseModify: (responseText: string) => {
            let responseJson: Record<string, any> = {}
            try {
                responseJson = JSON.parse(responseText)
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
                        block_me: undefined,
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

    hookHistory(history)
}

injectFunction()
