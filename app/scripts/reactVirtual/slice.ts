import { createAsyncThunk, createSlice, original, PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppThunk } from './store'
import * as API from './API'
import { fetchCount } from './API'
import { WeiboExtendState } from './interface'
import type { AsyncThunk } from '@reduxjs/toolkit'
import _ from 'lodash'

// define a queue to store api request
type APIFunc = (typeof API)[keyof typeof API]
type APIFuncName = keyof typeof API
export const getWeiboExtendState = (state: AppState): WeiboExtendState => state.weiboExtend

const initialState: WeiboExtendState & Record<string, any> = {
    requestInQueueFetching: false,
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

export const weiboExtendSlice = createSlice({
    name: 'weiboExtendSlice',
    initialState,
    reducers: {
        updateUserList: (state, action: PayloadAction<Partial<WeiboExtendState>>) => {
            console.log(`action.payload?`, action.payload)
            return { ...state, userList: action.payload?.userList }
        },
        setRequestInQueueFetching: (state, action: PayloadAction<boolean>) => {
            state.requestInQueueFetching = action.payload
        },
        updateState: (state, action: PayloadAction<Partial<WeiboExtendState>>) => {
            return { ...state, ...action.payload }
        },
    },
    extraReducers: builder => {
        builder.addCase(gethCount.fulfilled, (state, action) => {
            if (action.payload as any) {
                const { status, data } = (action.payload as any) || {}
                state.count = (status && !_.isEmpty(data?.poems) && data.poems) || []
            } else {
                return { ...state }
            }
        })
    },
})

// export actions
export const { updateState, updateUserList } = weiboExtendSlice.actions
export default weiboExtendSlice.reducer
