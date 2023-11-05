export interface WeiboExtendState extends Record<string, any> {
    requestInQueueFetching: boolean
    blackUserList?: any[]
    blackLikeText?: string
    followersRemoved: Array<string>
    showRemoveFans?: boolean
    showBlockOtherFans?: boolean
    showFloatingPopup?: boolean

    showWeiboPop: WeiboPopType
}

export type UserType = { uid: string; avatar: string; title: string; isBlocked?: boolean }

export enum WeiboPopType {
    hidden = `hidden`,
    typeSelect = `typeSelect`,
    saving = `saving`,
    savingFav = `savingFav`,
    stop = `stop`,
    completed = `completed`,
    downloadPost = `downloadPost`,
}
