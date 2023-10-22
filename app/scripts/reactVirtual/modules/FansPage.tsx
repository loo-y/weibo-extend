import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getWeiboExtendState, removeFans } from '../slice'

const FansPage: React.FC = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const removeFansCountRef = useRef(null)
    const { showRemoveFans } = state || {}

    const handleStartBtn = () => {
        const removeFansCount: number = Number((removeFansCountRef.current as unknown as HTMLInputElement)?.value) || 0
        dispatch(
            removeFans({
                uid: globalThis.myUid,
                count: removeFansCount,
            })
        )
    }

    if (!showRemoveFans) return null

    return (
        <div className="fanspage absolute top-[4.75rem] left-1/2 -ml-[12rem] [@media(max-width:1161px)]:-ml-[76px] [@media(max-width:872px)]:left-[360px] [@media(max-width:872px)]:ml-0">
            <div className="flex flex-row text-xs h-7 items-center font-bold rounded-xl px-2 bg-stone-200">
                <span>批量移除非互关粉丝：</span>
                <input
                    type="number"
                    ref={removeFansCountRef}
                    className=" h-5 outline-none w-10 border-none bg-stone-100 rounded-md"
                    defaultValue={0}
                    step={1}
                    max={30000}
                    min={0}
                />
                <button
                    className="h5 ml-2 appearance-none border-none bg-orange-500 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-orange-600"
                    onClick={handleStartBtn}
                >
                    开始
                </button>
            </div>
        </div>
    )
}

export default FansPage
