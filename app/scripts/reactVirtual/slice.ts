import { createAsyncThunk, createSlice, original, PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppThunk } from './store'
import * as API from './API'
import {
    fetchCount,
    fetchToDestroyFollowers,
    fetchToBlockUser,
    fetchToGetOthersFriends,
    fetchToGetMyFriends,
    fetchToGetBlog,
    fetchToSearchProfile,
    fetchToGetMyFav,
} from './API'
import { WeiboExtendState, WeiboPopType } from './interface'
import type { AsyncThunk } from '@reduxjs/toolkit'
import { saveBlogToZip } from '../utils/tools'
import _ from 'lodash'
import dayjs from 'dayjs'

// define a queue to store api request
type APIFunc = (typeof API)[keyof typeof API]
type APIFuncName = keyof typeof API
export const getWeiboExtendState = (state: AppState): WeiboExtendState => state.weiboExtend

const initialState: WeiboExtendState & Record<string, any> = {
    requestInQueueFetching: false,
    showFloatingPopup: false,
    followersRemoved: [],
    showWeiboPop: WeiboPopType.hidden,
}

type RequestCombo = {
    apiRequest: APIFunc
    asyncThunk?: AsyncThunk<any, any, any>
}
const apiRequestQueue: Array<RequestCombo> = []
// define a thunk action to wrap api request
const makeApiRequestInQueue = createAsyncThunk(
    'weiboExtendSlice/makeApiRequestInQueue',
    async (requestCombo: RequestCombo, { dispatch, getState }: any) => {
        const weiboExtendState = getWeiboExtendState(getState())
        const { requestInQueueFetching } = weiboExtendState || {}

        // 将接口请求添加到队列中，并设置isFetching为true
        apiRequestQueue.push(requestCombo)

        if (requestInQueueFetching) {
            // if there is a request in progress, return a resolved Promise
            return Promise.resolve()
        }

        const { setRequestInQueueFetching } = weiboExtendSlice.actions
        dispatch(setRequestInQueueFetching(true))

        // loop through the queue and process each request
        while (apiRequestQueue.length > 0) {
            const nextRequestCombo = apiRequestQueue.shift()
            if (nextRequestCombo) {
                const { apiRequest, asyncThunk } = nextRequestCombo || {}

                // send api request
                try {
                    // @ts-ignore
                    asyncThunk && dispatch(asyncThunk.pending())
                    // @ts-ignore
                    dispatch(makeApiRequestInQueue.pending())
                    // @ts-ignore
                    const response = await apiRequest()
                    // @ts-ignore
                    asyncThunk && dispatch(asyncThunk.fulfilled(response))
                    // @ts-ignore
                    dispatch(makeApiRequestInQueue.fulfilled(response))
                } catch (error) {
                    // @ts-ignore
                    asyncThunk && dispatch(asyncThunk.rejected(error))
                    // @ts-ignore
                    dispatch(makeApiRequestInQueue.rejected(error))
                }
            }
        }

        // set RequestInQueueFetching to false when all requests are processed
        dispatch(setRequestInQueueFetching(false))
    }
)

export const gethCount = createAsyncThunk(
    'weiboExtendSlice/gethCount',
    async (params: Record<string, any> = {}, { dispatch, getState }: any) => {
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        dispatch(
            makeApiRequestInQueue({
                apiRequest: fetchCount.bind(null, {
                    count: params.count,
                }),
                asyncThunk: gethCount,
            })
        )
    }
)

// fetchToRemoveFans
export const destroyFollowers = createAsyncThunk(
    'weiboExtendSlice/destroyFollowers',
    async (params: { uid: string } = { uid: '' }, { dispatch, getState }: any) => {
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        if (!params?.uid) return
        dispatch(
            makeApiRequestInQueue({
                apiRequest: fetchToDestroyFollowers.bind(null, {
                    uid: params.uid,
                }),
                asyncThunk: destroyFollowers,
            })
        )
    }
)

export const blockUser = createAsyncThunk(
    'weiboExtendSlice/blockUser',
    async (params: { uid: string } = { uid: '' }, { dispatch, getState }: any) => {
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        dispatch(
            makeApiRequestInQueue({
                apiRequest: fetchToBlockUser.bind(null, {
                    uid: params.uid,
                }),
                asyncThunk: blockUser,
            })
        )
    }
)

export const unblockUser = createAsyncThunk(
    'weiboExtendSlice/unblockUser',
    async (params: { uid: string } = { uid: '' }, { dispatch, getState }: any) => {
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        dispatch(
            makeApiRequestInQueue({
                apiRequest: fetchToBlockUser.bind(null, {
                    uid: params.uid,
                    unblock: true,
                }),
                asyncThunk: unblockUser,
            })
        )
    }
)

export const removeFans = createAsyncThunk(
    'weiboExtendSlice/removeFans',
    async (
        params: { uid: string; count: number; pageIndex?: number } = { uid: '', count: 0 },
        { dispatch, getState }: any
    ) => {
        dispatch(updateState({ fansPageremovingFans: '' }))
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        if (!params?.count) return
        const pageIndex = params?.pageIndex || 1
        console.log(`pageIndex`, pageIndex)
        const friendsResp = await fetchToGetMyFriends({ uid: params.uid, pageIndex })
        const { next_page, users } = friendsResp?.data || {}
        const friends = users?.length ? users : []
        console.log(`friends`, friends)
        if (_.isEmpty(friends)) {
            return true
        }
        let removeCount = 0
        for (let friend of friends) {
            // 仅移除非互相关注的粉丝
            if (!friend?.following) {
                await fetchToDestroyFollowers({ uid: friend?.idstr })
                dispatch(updateState({ fansPageremovingFans: friend?.screen_name || friend?.name || '' }))
                removeCount++
                if (removeCount >= params.count) {
                    dispatch(updateState({ fansPageremovingFans: '__completed__' }))
                    return friends
                }
            }
        }

        if (!(next_page > 0)) {
            dispatch(updateState({ fansPageremovingFans: '__completed__' }))
            return friends
        }
        dispatch(removeFans({ uid: params.uid, count: params.count - friends.length, pageIndex: pageIndex + 1 }))
        return null
    }
)

export const blockOthersFans = createAsyncThunk(
    'weiboExtendSlice/blockOthersFans',
    async (
        params: { otherUid: string; pageIndex?: number } = { otherUid: '', pageIndex: 1 },
        { dispatch, getState }: any
    ) => {
        dispatch(updateStopBlockOthers(false))
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        const otherUid = params?.otherUid || ''
        const pageIndex = params?.pageIndex || 1
        if (!params?.otherUid) return

        const friendsResp = await fetchToGetOthersFriends({ uid: params.otherUid, pageIndex })
        const { next_page, users } = friendsResp?.data || {}
        const friends = users?.length ? users : []
        if (_.isEmpty(friends)) {
            return true
        }
        for (let friend of friends) {
            const stopBlockOthers = getWeiboExtendState(getState()).stopBlockOthers
            if (stopBlockOthers) {
                return true
            }
            await fetchToBlockUser({ uid: friend.idstr })
            dispatch(updateState({ fansPageBlockingUser: friend?.screen_name || friend?.name || '' }))
        }
        if (!(next_page > 0)) return true
        dispatch(blockOthersFans({ otherUid, pageIndex: pageIndex + 1 }))
        return null
    }
)

export const unBlockOthersFans = createAsyncThunk(
    'weiboExtendSlice/unBlockOthersFans',
    async (
        params: { otherUid: string; pageIndex?: number } = { otherUid: '', pageIndex: 1 },
        { dispatch, getState }: any
    ) => {
        dispatch(updateStopBlockOthers(false))
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        const otherUid = params?.otherUid || ''
        const pageIndex = params?.pageIndex || 1
        if (!params?.otherUid) return

        const friendsResp = await fetchToGetOthersFriends({ uid: params.otherUid, pageIndex })
        const { next_page, users } = friendsResp?.data || {}
        const friends = users?.length ? users : []
        if (_.isEmpty(friends)) {
            return true
        }
        for (let friend of friends) {
            const stopBlockOthers = getWeiboExtendState(getState()).stopBlockOthers
            if (stopBlockOthers) {
                return true
            }
            await fetchToBlockUser({ uid: friend.idstr, unblock: true })
            dispatch(updateState({ fansPageUnBlockingUser: friend?.screen_name || friend?.name || '' }))
        }

        if (!(next_page > 0)) return true
        dispatch(unBlockOthersFans({ otherUid, pageIndex: pageIndex + 1 }))
        return null
    }
)

interface ISaveweiboQueueProps {
    uid: string
    pageIndex?: number
    start?: number
    startDate?: Date
    endDate?: Date
    isMyFav?: boolean
}
export const saveWeiboQueue = createAsyncThunk(
    'weiboExtendSlice/saveWeiboQueue',
    async (
        {
            uid = '',
            pageIndex: paramsPageIndex = 1,
            start: paramsStart,
            startDate,
            endDate,
            isMyFav,
        }: ISaveweiboQueueProps,
        { dispatch, getState }: any
    ) => {
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        let pageIndex = paramsPageIndex || 1
        const otherUid = uid || ''
        const start = paramsStart || 0

        dispatch(updateStopBlockOthers(false))
        dispatch(
            updateState({
                stopSaving: false,
                showWeiboPop: WeiboPopType.saving,
                currentSavingWeiboCount: 0,
                totalCountSaveingWeibo: pageIndex < 2 ? 0 : weiboExtendState.totalCountSaveingWeibo || 0,
            })
        )

        if (!otherUid) return

        const startTimeShortSpan = (startDate && dayjs(startDate).unix()) || undefined
        // 0点问题，所以要加 1 day
        const endTimeShortSpan = (endDate && dayjs(endDate).add(1, 'day').unix()) || undefined
        let isEnd = false
        // 获取单次保存的列表
        const onePageCount = 100
        let onePageList: Record<string, any>[] = []
        let totalCountSaveingWeibo = 0
        for (let count = 0; count < onePageCount; ) {
            const blogsResp = isMyFav
                ? await fetchToGetMyFav({ uid: otherUid, pageIndex })
                : startTimeShortSpan && endTimeShortSpan
                ? await fetchToSearchProfile({ uid: otherUid, pageIndex, startTimeShortSpan, endTimeShortSpan })
                : await fetchToGetBlog({ uid: otherUid, pageIndex })
            pageIndex++
            const { list, hasMore, total } = blogsResp?.data || {}
            totalCountSaveingWeibo = total || totalCountSaveingWeibo
            dispatch(updateState({ totalCountSaveingWeibo }))
            count += list?.length || 0
            onePageList = onePageList.concat(list)
            isEnd = !hasMore
            if (!hasMore) break
        }

        console.log(`onePageList`, onePageList)
        if (_.isEmpty(onePageList)) {
            dispatch(
                updateState({
                    showWeiboPop: WeiboPopType.completed,
                    // currentSavingWeiboCount: 0,
                    currentSavingWeiboPicCount: 0,
                    currentSavingWeiboVideoCount: 0,
                })
            )
            return null
        }

        const attachedName = isMyFav
            ? `${uid}_Favorites`
            : startDate && endDate
            ? dayjs(startDate).format('YYYYMMDD') + '_' + dayjs(endDate).format('YYYYMMDD')
            : `total`
        await saveBlogToZip({
            myBlog: onePageList,
            start,
            isMyFav,
            attachedName,
            eachCallback: ({ weiboCount, weiboPicCount, weiboVideoCount }) => {
                const { stopSaving } = getWeiboExtendState(getState())
                if (stopSaving) {
                    location.reload()
                }

                dispatch(
                    updateState({
                        currentSavingWeiboCount: start + weiboCount,
                        currentSavingWeiboPicCount: weiboPicCount || 0,
                        currentSavingWeiboVideoCount: weiboVideoCount || 0,
                    })
                )
            },
        })
        const { stopSaving } = getWeiboExtendState(getState())
        if (isEnd || stopSaving) {
            dispatch(
                updateState({
                    showWeiboPop: WeiboPopType.completed,
                    // currentSavingWeiboCount: 0,
                    currentSavingWeiboPicCount: 0,
                    currentSavingWeiboVideoCount: 0,
                })
            )
            return null
        }
        dispatch(
            saveWeiboQueue({
                uid: otherUid,
                pageIndex,
                startDate,
                endDate,
                start: start + (onePageList?.length || 0),
                isMyFav,
            })
        )
    }
)

export const savingMyFav = createAsyncThunk(
    'weiboExtendSlice/savingMyFav',
    async ({ uid }: Pick<ISaveweiboQueueProps, 'uid'>, { dispatch, getState }: any) => {
        dispatch(updateStopBlockOthers(false))
        const weiboExtendState: WeiboExtendState = getWeiboExtendState(getState())
        dispatch(
            updateState({
                showFloatingPopup: false,
                stopSaving: false,
                showWeiboPop: WeiboPopType.savingFav,
            })
        )
        dispatch(saveWeiboQueue({ uid: uid, isMyFav: true }))
    }
)

export const downloadPost = createAsyncThunk(
    'weiboExtendSlice/downloadPost',
    async ({ uid, mblogId }: Pick<ISaveweiboQueueProps, 'uid'> & { mblogId: string }, { dispatch, getState }: any) => {
        dispatch(updateStopBlockOthers(false))
    }
)

export const weiboExtendSlice = createSlice({
    name: 'weiboExtendSlice',
    initialState,
    reducers: {
        updateStopBlockOthers: (state, action: PayloadAction<boolean>) => {
            apiRequestQueue.length = 0
            return { ...state, stopBlockOthers: action.payload, fansPageBlockingUser: '', fansPageUnBlockingUser: '' }
        },
        updateShowFloatingPopup: (state, action: PayloadAction<boolean>) => {
            apiRequestQueue.length = 0
            return { ...state, showFloatingPopup: action.payload }
        },
        updateShowRemoveFansBlock: (state, action: PayloadAction<boolean>) => {
            // 当列表更新时，清空原本调用的接口queue
            apiRequestQueue.length = 0
            return { ...state, blackUserList: [], showRemoveFans: action.payload }
        },
        updateshowBlockOtherFansBlock: (state, action: PayloadAction<boolean>) => {
            // 当列表更新时，清空原本调用的接口queue
            apiRequestQueue.length = 0
            return { ...state, blackUserList: [], showBlockOtherFans: action.payload }
        },
        updateBlackUserList: (state, action: PayloadAction<Partial<WeiboExtendState>>) => {
            // 当列表更新时，清空原本调用的接口queue
            apiRequestQueue.length = 0
            return { ...state, blackUserList: action.payload?.blackUserList }
        },
        updateBlackLikeText: (state, action: PayloadAction<{ blackLikeText: string }>) => {
            return { ...state, blackLikeText: action.payload?.blackLikeText }
        },
        setRequestInQueueFetching: (state, action: PayloadAction<boolean>) => {
            state.requestInQueueFetching = action.payload
        },
        updateState: (state, action: PayloadAction<Partial<WeiboExtendState>>) => {
            return { ...state, ...action.payload }
        },
        clearRequestQueue: state => {
            apiRequestQueue.length = 0
            return { ...state }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(gethCount.fulfilled, (state, action) => {
                if (action.payload as any) {
                    const { status, data } = (action.payload as any) || {}
                    state.count = (status && !_.isEmpty(data?.count) && data.count) || []
                } else {
                    return { ...state }
                }
            })
            .addCase(blockUser.fulfilled, (state, action) => {
                if (action.payload as any) {
                    const { status, data } = (action.payload as any) || {}
                    if (status && data?.uid) {
                        if (!_.isEmpty(state.blackUserList)) {
                            _.map(state.blackUserList, user => {
                                if (user.uid == data.uid) {
                                    user.isBlocked = true
                                }
                                return {
                                    ...user,
                                }
                            })
                        }
                    }
                } else {
                    return { ...state }
                }
            })
            .addCase(unblockUser.fulfilled, (state, action) => {
                if (action.payload as any) {
                    const { status, data } = (action.payload as any) || {}
                    if (status && data?.uid) {
                        if (!_.isEmpty(state.blackUserList)) {
                            _.map(state.blackUserList, user => {
                                if (user.uid == data.uid) {
                                    user.isBlocked = false
                                }
                                return {
                                    ...user,
                                }
                            })
                        }
                    }
                } else {
                    return { ...state }
                }
            })
            .addCase(destroyFollowers.fulfilled, (state, action) => {
                if (action.payload as any) {
                    const { status, data } = (action.payload as any) || {}
                    console.log(`destroyFollowers--->`, data.uid)
                    if (status && data?.uid) {
                        if (_.isEmpty(state.followersRemoved)) {
                            state.followersRemoved = [data.uid]
                        } else if (!state.followersRemoved.includes(data.uid)) {
                            state.followersRemoved.push(data.uid)
                        }
                    }
                } else {
                    return { ...state }
                }
            })
            .addCase(removeFans.fulfilled, (state, action) => {
                return state
            })
    },
})

// export actions
export const {
    updateState,
    updateShowFloatingPopup,
    updateStopBlockOthers,
    updateBlackUserList,
    updateShowRemoveFansBlock,
    updateshowBlockOtherFansBlock,
    updateBlackLikeText,
    clearRequestQueue,
} = weiboExtendSlice.actions
export default weiboExtendSlice.reducer
