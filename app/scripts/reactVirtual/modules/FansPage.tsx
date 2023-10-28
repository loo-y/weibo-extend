import React, { useEffect, useState, useRef } from 'react'
import _ from 'lodash'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getWeiboExtendState, removeFans, blockOthersFans, unBlockOthersFans, updateStopBlockOthers } from '../slice'

const FansPage: React.FC = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()

    return (
        <div className="fanspage absolute top-[4.75rem] left-1/2 -ml-[12rem] [@media(max-width:1161px)]:-ml-[76px] [@media(max-width:872px)]:left-[360px] [@media(max-width:872px)]:ml-0  z-[99]">
            <RemoveMyFans />
            <BlockOthersFans />
        </div>
    )
}

export default FansPage

const BlockOthersFans = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const { showBlockOtherFans, fansPageBlockingUser, fansPageUnBlockingUser } = state || {}
    const blockFansCountRef = useRef(null)
    const [showBlock, setShowBlock] = useState(false)
    const [otherUid, setOtherUid] = useState('')

    useEffect(() => {
        const currentHref = document?.location?.href || ``
        if (!currentHref.includes(globalThis.myUid) && currentHref.includes(`relate=fans`)) {
            setShowBlock(true)
            const _uid = currentHref.match(/follow\/(\d+)/)?.[1] || ``
            setOtherUid(_uid)
        } else {
            setShowBlock(false)
            setOtherUid('')
        }
    }, [document?.location?.href])

    const handleStartBlockBtn = () => {
        if (otherUid) {
            dispatch(
                blockOthersFans({
                    otherUid,
                })
            )
        }
    }
    const handleStopBtn = () => {
        dispatch(updateStopBlockOthers(true))
    }

    const handleStartUnBlockBtn = () => {
        if (otherUid) {
            dispatch(
                unBlockOthersFans({
                    otherUid,
                })
            )
        }
    }

    console.log(`showBlockOtherFans`, showBlockOtherFans, showBlock)
    if (!showBlock) return null
    if (!showBlockOtherFans) return null

    return (
        <div className="flex flex-row gap-2 text-xs h-7 font-bold bg-transparent w-[38rem]">
            <div className="flex flex-row rounded-xl bg-stone-200 px-2 items-center w-[14.5rem]">
                <span>拉黑TA的所有粉丝</span>
                <button
                    className="h5 ml-2 appearance-none border-none bg-orange-500 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-orange-600"
                    onClick={handleStartBlockBtn}
                >
                    开始
                </button>
                <button
                    className="h5 ml-2 appearance-none border-none bg-orange-500 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-orange-600"
                    onClick={handleStopBtn}
                >
                    停止
                </button>
                <button
                    className="h5 ml-2 appearance-none border-none bg-orange-500 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-orange-600"
                    onClick={handleStartUnBlockBtn}
                >
                    解除
                </button>
            </div>
            <div className="flex flex-row items-center gap-1">
                {fansPageBlockingUser ? (
                    <>
                        <span>{fansPageBlockingUser}</span>
                        <span>已拉黑</span>
                    </>
                ) : null}
                {fansPageUnBlockingUser ? (
                    <>
                        <span>{fansPageUnBlockingUser}</span>
                        <span>已解除</span>
                    </>
                ) : null}
            </div>
        </div>
    )
}

const RemoveMyFans = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const removeFansCountRef = useRef(null)
    const { showRemoveFans, fansPageremovingFans } = state || {}
    const [showBlock, setShowBlock] = useState(false)

    useEffect(() => {
        if (document.location.href.includes(globalThis.myUid)) {
            setShowBlock(true)
        } else {
            setShowBlock(false)
        }
    }, [document?.location?.href])

    const handleStartBtn = () => {
        const removeFansCount: number = Number((removeFansCountRef.current as unknown as HTMLInputElement)?.value) || 0
        dispatch(
            removeFans({
                uid: globalThis.myUid,
                count: removeFansCount,
            })
        )
    }

    if (!showBlock) return null
    if (!showRemoveFans) return null

    return (
        <div className="flex flex-row gap-2 text-xs h-7 font-bold bg-transparent w-[38rem]">
            <div className="flex flex-row rounded-xl bg-stone-200 px-2 items-center w-[13rem]">
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
            <div className="flex flex-row items-center gap-1">
                {fansPageremovingFans ? (
                    fansPageremovingFans == `__completed__` ? (
                        <span>{`已移除完毕`}</span>
                    ) : (
                        <>
                            <span>{fansPageremovingFans}</span>
                            <span>已移除</span>
                        </>
                    )
                ) : null}
            </div>
        </div>
    )
}
