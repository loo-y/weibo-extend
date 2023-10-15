export interface WeiboExtendState extends Record<string, any> {
    requestInQueueFetching: boolean
    userList?: any[]
}

export type UserType = { uid: string; avatar: string; title: string }
