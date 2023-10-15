export interface WeiboExtendState extends Record<string, any> {
    requestInQueueFetching: boolean
    blackUserList?: any[]
    blackLikeText?: string
}

export type UserType = { uid: string; avatar: string; title: string; isBlocked?: boolean }
