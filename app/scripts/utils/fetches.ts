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
}
export const fetchToBlockUser = async (props?: IFetchToBlockUserProps) => {
    const { uid } = props || {}
    if (!uid) return
    let result = {}
    try {
        const response = await baseFetch({
            url: `//weibo.com/ajax/statuses/filterUser`,
            body: { uid, status: 1, interact: 1, follow: 1 },
        })
        result = await response.json()
    } catch (e) {
        console.log(`fetchToBlockUser`)
    }

    return result
}

export const fetchToGetLikeUsers = async ({ commentId }: { commentId: string | number }) => {
    if (!commentId) return
    // https://weibo.com/aj/like/object/big?ajwvr=6&page=1&object_id=4956132537013171&object_type=comment
    let likeUsersHtml = ''
    try {
        const response = await baseFetch({
            url: `//weibo.com/aj/like/object/big?ajwvr=6&page=1&object_id=${commentId}&object_type=comment`,
            method: 'GET',
        })
        const result = await response.json()
        likeUsersHtml = result?.data?.html
    } catch (e) {
        console.log(`fetchToGetLikeUsers`)
    }

    return likeUsersHtml
}
