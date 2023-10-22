import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { useAppSelector, useAppDispatch } from '../hooks'
import { blockUser, unblockUser, getWeiboExtendState, clearRequestQueue, updateShowFloatingPopup } from '../slice'
import { floatingPopupList } from '../constants'

const FloatingPopup: React.FC = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const { showFloatingPopup } = state || {}

    const handleClick = (item: Record<string, any>) => {
        const { jumpUrl, beforeMatch } = item || {}
        const currentUrl = document.location.href
        if (currentUrl.match(beforeMatch)) {
            const jumpPageUrl = jumpUrl.replace(`{{uid}}`, globalThis.myUid || '')
            location.href = jumpPageUrl
        }
        dispatch(updateShowFloatingPopup(false))
    }

    if (!showFloatingPopup) return null

    return (
        <div className=" max-h-80 overflow-y-scroll overflow-x-hidden w-52 bg-gray-200 shadow-md rounded-lg right-4 absolute bottom-11">
            <div className="flex px-3 py-4 flex-col gap-2 text-sm font-semibold ">
                {_.map(floatingPopupList, (floatingPopupItem, itemIndex) => {
                    const { title } = floatingPopupItem || {}
                    return (
                        <div
                            key={`floating_popuplist_${itemIndex}`}
                            className="cursor-pointer flex-item h-8 flex items-center align-middle rounded-md hover:bg-gray-300 pl-2"
                            onClick={() => {
                                handleClick(floatingPopupItem)
                            }}
                        >
                            <span className="text-center">{title}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default FloatingPopup