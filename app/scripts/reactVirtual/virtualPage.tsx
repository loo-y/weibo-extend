'use client'
import React from 'react'
import _ from 'lodash'
import { createRoot } from 'react-dom/client'
import { useAppSelector, useAppDispatch } from './hooks'
import { getWeiboExtendState } from './slice'
import { weiboExtendVirtualRootId } from '../utils/constants'
import { UserType } from './interface'
import { Provider } from 'react-redux'
import store from './store'

const UserLikeList: React.FC = () => {
    const state = useAppSelector(getWeiboExtendState)
    const { userList } = state || {}
    console.log(`userList`, userList)

    const handleUserClick = (userInfo: UserType) => {
        const { uid, avatar, title } = userInfo || {}
        const url = /\d+/.test(uid) ? '//weibo.com/u/' + uid : '//weibo.com/' + uid
        window.open(url, '_blank')
    }

    if (_.isEmpty(userList)) return null

    return (
        <div>
            {_.map(userList, (userInfo, usr_index) => {
                const { uid, avatar, title } = userInfo || {}

                return (
                    <div
                        className=" cursor-pointer"
                        key={`userlist_${usr_index}`}
                        onClick={() => {
                            handleUserClick(userInfo)
                        }}
                    >
                        <img src={avatar} alt={title} />
                        <span>{title}</span>
                    </div>
                )
            })}
        </div>
    )
}

const App = () => {
    return (
        <Provider store={store}>
            <UserLikeList />
        </Provider>
    )
}

export const renderVirtualPage = () => {
    const virtualRoot = document.getElementById(weiboExtendVirtualRootId) as HTMLElement
    const root = createRoot(virtualRoot)
    root.render(
        <div className="fixed left-0 top-0">
            <App />
        </div>
    )
}
