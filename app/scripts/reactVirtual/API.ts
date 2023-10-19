import _ from 'lodash'
import { sleep } from '../utils/tools'

const commonOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
}

// example
export const fetchCount = async ({ count }: { count: number }) => {
    let data = null,
        status = false
    try {
        const response = await fetch('/api/count', {
            ...commonOptions,
            body: JSON.stringify({ count }),
        })
        if (!response.ok) {
            // throw new Error(response.statusText)
            return {
                status,
                data,
            }
        }
        data = await response.json()
        status = true
    } catch (e) {
        console.log(`fetchPoems`, e)
    }

    return {
        data,
        status,
    }
}

interface IBaseFetchProps {
    url: string
    method?: 'POST' | 'GET'
    body?: Record<string, any>
}

const baseFetch = ({ url, body, method }: IBaseFetchProps) => {
    method = method || 'POST'
    return fetch(url, {
        method,
        headers: {
            accept: 'application/json, text/plain, */*',
            'x-requested-with': 'XMLHttpRequest',
            'x-xsrf-token': globalThis.xsrfToken,
            'content-type': 'application/json;charset=UTF-8',
        },
        body: body ? JSON.stringify(body) : undefined,
    })
}

interface IFetchToBlockUserProps {
    uid?: string
    unblock?: boolean
}
export const fetchToBlockUser = async (props?: IFetchToBlockUserProps) => {
    let data = null,
        status = false
    const { uid, unblock } = props || {}

    if (!uid) return { data, status }
    const blockVaule = unblock ? 0 : 1
    try {
        const response = await baseFetch({
            url: `//weibo.com/ajax/statuses/filterUser`,
            body: { uid, status: blockVaule, interact: blockVaule, follow: blockVaule },
        })
        data = await response.json()
        // 防止过快导致接口请求被封
        await sleep(0.3)
        data = { ...(data || {}), uid }
        status = true
    } catch (e) {
        console.log(`fetchToBlockUser`)
    }

    return { data, status }
}