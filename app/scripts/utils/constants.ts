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
