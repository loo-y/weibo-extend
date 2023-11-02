export const floatingPopupList = [
    {
        title: `备份当前用户微博`,
        onClick: `handleSaveWeibo`,
    },
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
    {
        title: `我的收藏`,
        jumpUrl: `/u/page/fav/{{uid}}`,
        beforeMatch: new RegExp('^(?!.*page/fav/\\d+$).*$'),
    },
    {
        title: `备份我的收藏`,
        onClick: `handleSaveMyFav`,
    },
    {
        title: `我的黑名单`,
        jumpUrl: `/set/shield?type=user`,
        beforeMatch: new RegExp('^(?!.*set\\/shield\\?type=user$).*$'),
    },
]

export const weiboMainHost = `weibo.com`
