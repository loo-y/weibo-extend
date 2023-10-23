export const floatingPopupList = [
    {
        title: `粉丝列表`,
        jumpUrl: `/u/page/follow/{{uid}}?relate=fans`,
        beforeMatch: new RegExp('^(?!.*relate=fans).*$'),
    },
    {
        title: `我的关注`,
        jumpUrl: `/u/page/follow/{{uid}}`,
        beforeMatch: new RegExp('^(?!.*page/follow/\\d+$).*$'),
    },
]

export const weiboMainHost = `weibo.com`
