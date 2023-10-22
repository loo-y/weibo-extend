'use client'
import React from 'react'
import _ from 'lodash'
import { createRoot } from 'react-dom/client'
import { weiboExtendVirtualRootId } from '../utils/constants'
import { Provider } from 'react-redux'
import store from './store'
import LikeUserList from './modules/LikeUserList'
import FloatingActionBall from './modules/FloatingActionBall'
import FansPage from './modules/FansPage'

const App = () => {
    return (
        <Provider store={store}>
            <FansPage />
            <FloatingActionBall />
            <LikeUserList />
        </Provider>
    )
}

export const renderVirtualPage = () => {
    const virtualRoot = document.getElementById(weiboExtendVirtualRootId) as HTMLElement
    const root = createRoot(virtualRoot)
    root.render(
        <div className="left-0 top-0">
            <App />
        </div>
    )
}
