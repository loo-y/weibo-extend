import React from 'react'
import _ from 'lodash'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { UserType } from './interface'

interface IShowUserListRProps {
    userList: UserType[]
}
export const ShowUserListR: React.FC<IShowUserListRProps> = ({ userList }) => {
    if (_.isEmpty(userList)) return

    return (
        <div>
            {_.map(userList, userInfo => {
                const { uid, avatar, title } = userInfo || {}
                const hrefUrl = /\d+/.test(uid) ? '//weibo.com/u/' + uid : '//weibo.com/' + uid
                return (
                    <div>
                        <img src={avatar} alt={title} />
                        <a href={hrefUrl} target="_blank">
                            <span>{title}</span>
                        </a>
                    </div>
                )
            })}
        </div>
    )
}

export const XShowUserListR = ({ userList }: IShowUserListRProps) => {
    if (!userList) {
        return
    }
    // const root = createRoot(document.body)
    // root.render(<ShowUserListR userList={userList} />)
    const container = document.createElement('div')
    document.body.appendChild(container)

    createPortal(<ShowUserListR userList={userList} />, container)

    // return result;
}
