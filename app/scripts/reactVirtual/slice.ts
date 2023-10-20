import { createAsyncThunk, createSlice, original, PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppThunk } from './store'
import * as API from './API'
import { fetchCount, fetchToDestroyFollowers, fetchToBlockUser } from './API'
import { WeiboExtendState } from './interface'
import type { AsyncThunk } from '@reduxjs/toolkit'
import { isType } from '../utils/tools'
import _ from 'lodash'

// define a queue to store api request
type APIFunc = (typeof API)[keyof typeof API]
type APIFuncName = keyof typeof API
export const getWeiboExtendState = (state: AppState): WeiboExtendState => state.weiboExtend

const initialState: WeiboExtendState & Record<string, any> = {
    requestInQueueFetching: false,
    // followersRemoved: initFollowersRemoved
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

export const weiboExtendSlice = createSlice({
    name: 'weiboExtendSlice',
    initialState,
    reducers: {
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
                    if (status && data?.uid) {
                        if (!isType(state?.followersRemoved, Set)) {
                            state.followersRemoved = new Set(data.uid)
                        } else {
                            state.followersRemoved.add(data.uid)
                        }
                    }
                } else {
                    return { ...state }
                }
            })
    },
})

// export actions
export const { updateState, updateBlackUserList, updateBlackLikeText, clearRequestQueue } = weiboExtendSlice.actions
export default weiboExtendSlice.reducer
