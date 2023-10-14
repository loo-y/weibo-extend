import _ from 'lodash'
import { UserType } from './interface'
import { LimitPageOflikeUserFetch } from './constants'

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
