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

interface IBlockUserProps {
    uid?: string
    unblock?: boolean
}
export const fetchToBlockUser = async (props?: IBlockUserProps) => {
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
        console.log(`fetchToBlockUser`, e)
    }

    return { data, status }
}

interface IDestroyFollowersProps {
    uid?: string
}
export const fetchToDestroyFollowers = async (props?: IDestroyFollowersProps) => {
    let data = null,
        status = false
    const { uid } = props || {}

    if (!uid) return { data, status }
    try {
        const response = await baseFetch({
            url: `//weibo.com/ajax/profile/destroyFollowers`,
            body: { uid },
        })
        data = await response.json()
        // 防止过快导致接口请求被封
        await sleep(0.3)
        data = { ...(data || {}), uid }
        status = true
    } catch (e) {
        console.log(`fetchToDestroyFollowers`, e)
    }

    return { data, status }
}

interface IGetFriendsProps {
    uid: string
    pageIndex?: number
}
// fansSortType: fansCount / followTime
export const fetchToGetMyFriends = async (props: IGetFriendsProps) => {
    let data = null,
        status = false
    const { uid, pageIndex = 1 } = props || {}

    if (!uid) return { data, status }

    try {
        const response = await baseFetch({
            url: `//weibo.com/ajax/friendships/friends?uid=${uid}&relate=fans&count=20&page=${pageIndex}&type=fans&fansSortType=fansCount`,
            method: 'GET',
        })
        data = await response.json()
        // 防止过快导致接口请求被封
        await sleep(0.3)
        data = { ...(data || {}), uid, hasMore: data?.next_page > 0 }
        status = true
    } catch (e) {
        console.log(`fetchToGetFriends`, e)
    }

    return { data, status }
}

export const fetchToGetOthersFriends = async (props: IGetFriendsProps) => {
    let data = null,
        status = false
    const { uid, pageIndex = 1 } = props || {}

    if (!uid) return { data, status }

    try {
        const response = await baseFetch({
            url: `//weibo.com/ajax/friendships/friends?uid=${uid}&relate=fans&count=20&page=${pageIndex}&type=all&newFollowerCount=0`,
            method: 'GET',
        })
        data = await response.json()
        // 防止过快导致接口请求被封
        await sleep(0.3)
        data = { ...(data || {}), uid, hasMore: data?.next_page > 0 }
        status = true
    } catch (e) {
        console.log(`fetchToGetFriends`, e)
    }

    return { data, status }
}

export const fetchToGetBlog = async (props: { uid: string; since_id?: string; pageIndex?: number }) => {
    let data = null,
        status = false
    const { uid, pageIndex = 1, since_id } = props || {}

    if (!uid) return { data, status }

    try {
        const response = await baseFetch({
            url: `//weibo.com/ajax/statuses/mymblog?uid=${uid}&page=${pageIndex}&feature=0${
                since_id ? '&since_id=' + since_id : ''
            }`,
            method: 'GET',
        })
        const respJson = await response.json()
        const realData = respJson?.data || {}
        // 防止过快导致接口请求被封
        await sleep(0.3)
        data = { ...(realData || {}), uid, hasMore: !!realData?.since_id }
        status = true
    } catch (e) {
        console.log(`fetchToGetFriends`, e)
    }

    return { data, status }
}
