import _ from 'lodash'
import { UserType } from './interface'
import { LimitPageOflikeUserFetch } from './constants'
import { sleep } from './tools'

interface IBaseFetchProps {
    url: string
    method?: 'POST' | 'GET'
    body?: Record<string, any>
    headers?: Record<string, any>
    mode?: string
}

const baseFetch = ({ url, body, method, headers, mode }: IBaseFetchProps) => {
    method = method || 'POST'
    const requestHeaders = _.omitBy(
        {
            accept: 'application/json, text/plain, */*',
            'x-requested-with': 'XMLHttpRequest',
            'x-xsrf-token': globalThis.xsrfToken,
            'content-type': 'application/json;charset=UTF-8',
            ...headers,
        },
        _.isNil
    )
    let options: Record<string, any> = {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
    }
    if (mode) {
        options.mode = mode
    }
    return fetch(url, options)
}

const fetchfetchToGetLikeUsersByPage = async ({
    commentId,
    pageId,
}: {
    commentId: string | number
    pageId?: number
}) => {
    if (!pageId) pageId = 1
    let likeUsersHtml = '',
        userList: UserType[] = [],
        totalPage = 1,
        likeCounts = 0,
        hasMore = false
    try {
        const response = await baseFetch({
            url: `//weibo.com/aj/like/object/big?ajwvr=6&page=${pageId}&object_id=${commentId}&object_type=comment`,
            method: 'GET',
        })
        const result = await response.json()
        const { html, page, like_counts } = result?.data || {}
        likeUsersHtml = html
        ;(totalPage = page?.totalpage), (likeCounts = like_counts)
        hasMore = totalPage > pageId

        if (likeUsersHtml) {
            likeUsersHtml.replace(
                /\<li uid=\"(\d+)\"[\w\W].*\<img src\=\"([^\"]*)\" alt\=\"([^\"]*)\"/g,
                ($total, $uid, $avatar, $title) => {
                    // console.log($uid, $avatar, $title)
                    userList.push({
                        uid: $uid,
                        avatar: $avatar,
                        title: $title,
                    })
                    return ''
                }
            )
        }
    } catch (e) {
        console.log(`fetchfetchToGetLikeUsersByPage`)
    }

    return {
        likeUsersHtml,
        userList,
        totalPage,
        likeCounts,
        hasMore,
    }
}
export const fetchToGetLikeUsers = async ({ commentId }: { commentId: string | number }) => {
    if (!commentId) return
    const likeUsersFirstPage = await fetchfetchToGetLikeUsersByPage({ commentId, pageId: 1 })
    const { hasMore, totalPage, likeCounts } = likeUsersFirstPage || {}
    if (!hasMore) {
        return likeUsersFirstPage
    }

    let fetchList: any = []

    let likeUsersHtml = likeUsersFirstPage.likeUsersHtml,
        userList = likeUsersFirstPage.userList || []
    _.map(
        Array.from(
            { length: totalPage < LimitPageOflikeUserFetch ? totalPage : LimitPageOflikeUserFetch },
            (_, i) => i + 1
        ),
        pageId => {
            if (pageId > 1) {
                fetchList.push(fetchfetchToGetLikeUsersByPage({ commentId, pageId: pageId }))
            }
        }
    )
    const totalResult = await Promise.all(fetchList)
    _.map(totalResult, result => {
        likeUsersHtml += result.likeUsersHtml
        userList = userList.concat(result.userList || [])
    })

    return {
        totalPage,
        likeCounts,
        hasMore: false,
        likeUsersHtml,
        userList,
    }
}

export const fetchToGetImageBlob = async ({ imageUrl }: { imageUrl: string }): Promise<null | Blob> => {
    if (!imageUrl) return null
    try {
        const response = await baseFetch({
            url: imageUrl,
            method: 'GET',
        })

        const respBlob = await response.blob()
        // 防止请求过于密集
        await sleep(3 * Math.random())
        return respBlob
    } catch (e) {
        console.log(`fetchToGetImageBlob`, e)
    }
    return null
}

export const fetchToGetImageBlobByXHR = async ({ imageUrl }: { imageUrl: string }): Promise<null | Blob> => {
    if (!imageUrl) return null
    try {
        const responseBlob = await new Promise<Blob | null>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('get', imageUrl)
            xhr.responseType = 'blob'
            xhr.onload = () => {
                resolve(xhr.response as Blob)
            }
            xhr.send()
            xhr.onerror = () => {
                resolve(null)
            }
        })
        await sleep(3 * Math.random())
        return responseBlob
    } catch (e) {
        console.log(`fetchToGetImageBlobByXHR`, e)
    }
    return null
}

export const fetchToGetImageBlobByCloudflare = async ({ imageUrl }: { imageUrl: string }): Promise<null | Blob> => {
    if (!imageUrl) return null
    try {
        const responseBlob = await new Promise<Blob | null>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('get', `https://weibo-image-fetch.127321.xyz//?url=${encodeURIComponent(imageUrl)}`)
            xhr.responseType = 'blob'
            xhr.onload = () => {
                resolve(xhr.response as Blob)
            }
            xhr.send()
            xhr.onerror = () => {
                resolve(null)
            }
        })
        await sleep(3 * Math.random())
        return responseBlob
    } catch (e) {
        console.log(`fetchToGetImageBlobByXHR`, e)
    }
    return null
}

export const fetchToGetVideoBlob = async ({ videoUrl }: { videoUrl: string }): Promise<null | Blob> => {
    if (!videoUrl) return null
    try {
        const response = await baseFetch({
            url: videoUrl,
            method: 'GET',
            headers: {
                'content-type': undefined,
                accept: '*/*',
                'sec-fetch-dest': 'video',
                'accept-encoding': 'identity;q=1, *;q=0',
            },
            mode: 'no-cors',
        })
        const respBlob = await response.blob()
        // 防止请求过于密集
        await sleep(3 * Math.random())
        return respBlob
    } catch (e) {
        console.log(`fetchToGetVideoBlob`, e)
    }
    return null
}

export const fetchToGetVideoBlobByXHR = async ({ videoUrl }: { videoUrl: string }): Promise<null | Blob> => {
    if (!videoUrl) return null
    try {
        const responseBlob = await new Promise<Blob | null>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('get', videoUrl)
            xhr.responseType = 'blob'
            xhr.onload = () => {
                resolve(xhr.response as Blob)
            }
            xhr.send()
            xhr.onerror = () => {
                resolve(null)
            }
        })
        return responseBlob
    } catch (e) {
        console.log(`fetchToGetVideoBlobByXHR`, e)
    }
    return null
}

export const fetchToGetLongText = async ({ mblogId }: { mblogId?: string }) => {
    if (!mblogId) return null
    try {
        const response = await baseFetch({
            url: `//weibo.com/ajax/statuses/longtext?id=${mblogId}`,
            method: 'GET',
        })

        const result = await response.json()
        const { longTextContent } = result?.data || {}
        // 防止请求过于密集
        await sleep(3 * Math.random())
        return longTextContent || null
    } catch (e) {
        console.log(`fetchToGetLongText`, e)
    }
    return null
}
