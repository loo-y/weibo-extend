export const homePageTabList = [
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
]

const baseClassName = `weibo-extend`
export const weiboExtendVirtualRootId = `${baseClassName}-virtual-root`
export const weiboExtendClassNames = {
    base: baseClassName,
    root: `${baseClassName}-virtual-root`,
    blockLikeUsers: `${baseClassName}-block-like-users`,
    commentId: `${baseClassName}-commentid`,
}

// 限制最多获取多少页，防止请求过多被封
export const LimitPageOflikeUserFetch = 10

export const favIcon32 = `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`
