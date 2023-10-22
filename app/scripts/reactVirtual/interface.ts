export interface WeiboExtendState extends Record<string, any> {
    requestInQueueFetching: boolean
    blackUserList?: any[]
    blackLikeText?: string
    followersRemoved?: Set<string | number>
    showRemoveFans?: boolean
    showFloatingPopup?: boolean
}

export type UserType = { uid: string; avatar: string; title: string; isBlocked?: boolean }
