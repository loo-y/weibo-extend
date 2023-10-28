'use client'
import { useState } from 'react'
import _ from 'lodash'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getWeiboExtendState, updateState } from '../slice'

const SavingWeiboPopup = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const { showWeiboPop, totalCountSaveingWeibo, currentSavingWeiboCount, currentSavingWeiboPicCount } = state || {}

    const [showStopConfirm, setShowStopConfirm] = useState(false)
    const handleStop = () => {
        setShowStopConfirm(true)
    }

    const handleYesStop = () => {
        dispatch(
            updateState({
                stopSaving: true,
                showWeiboPop: false,
            })
        )
    }

    const handleCancelStop = () => {
        setShowStopConfirm(false)
    }

    if (!showWeiboPop) return null

    if (showStopConfirm) {
        return (
            <div className="flex fixed p-4 inset-0 bg-black bg-opacity-30 z-[9999]">
                <div className="bg-white absolute right-[5rem] top-[5rem] rounded-xl h-[12rem] w-[28rem] py-4 pl-8 pr-6 flex flex-col text-gray-500 gap-2">
                    <div className="title flex w-full text-2xl font-bold flex-row gap-2 mt-2">
                        <span className="">{`确定要停止备份吗？`}</span>
                    </div>

                    <div className="absolute bottom-6 right-6 flex mt-3 w-full item-center justify-end">
                        <div className="flex flex-row gap-6">
                            <button
                                className="relative rounded-lg bg-gray-400 px-3 py-1 text-gray-50 shadow-lg shadow-gray-400/50 hover:shadow-gray-400/50 hover:bg-gray-500  active:top-[0.5px] active:left-[0.5px]"
                                onClick={handleYesStop}
                            >
                                确定
                            </button>
                            <button
                                className="relative rounded-lg bg-orange-500 px-3 py-1 text-gray-50 shadow-lg shadow-orange-500/50 hover:shadow-orange-600/50 hover:bg-orange-600 active:top-[0.5px] active:left-[0.5px]"
                                onClick={handleCancelStop}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex fixed p-4 inset-0 bg-black bg-opacity-30 z-[9999]">
            <div className="bg-white absolute right-[5rem] top-[5rem] rounded-xl h-[12rem] w-[28rem] py-4 pl-8 pr-6 flex flex-col text-gray-500 gap-2">
                <div className="title flex w-full text-2xl font-bold flex-row gap-2 mt-2">
                    <div className="animate-bounce bg-white dark:bg-slate-800 p-2 w-10 h-10 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-lg rounded-full flex items-center justify-center">
                        <svg
                            className="w-5 h-5 text-orange-600 font-bold"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </div>
                    <span className="">{`正在备份中 ...`}</span>
                </div>
                <div className="ml-1 subtitle flex w-full text-xs text-gray-500 text-opacity-70">
                    <span>{`请勿关闭当前页面，正在抓紧备份。`}</span>
                </div>
                <div className="flex ml-1 mt-1 subtitle flex-row w-full text-xs text-gray-800 text-opacity-70 gap-2">
                    <div className="after:content-['|'] after:ml-2 after:text-gray-600 after:text-opacity-30 ">
                        <span>
                            {totalCountSaveingWeibo ? `一共${totalCountSaveingWeibo}条微博` : `当前微博总数：未知`}
                        </span>
                    </div>
                    {currentSavingWeiboCount ? (
                        <div>
                            <span>{`正在备份第${currentSavingWeiboCount || 'X'}条`}</span>
                        </div>
                    ) : null}
                    {currentSavingWeiboPicCount ? (
                        <div className="before:content-['|'] before:mr-2 before:text-gray-600 before:text-opacity-30 ">
                            <span>{`正在下载第${currentSavingWeiboPicCount}张图片`}</span>
                        </div>
                    ) : null}
                </div>
                <div className="flex mt-3 w-full item-center justify-end">
                    <div className="flex flex-row gap-6">
                        <button
                            className="relative rounded-lg bg-gray-400 px-3 py-1 text-gray-50 shadow-lg shadow-gray-400/50 hover:shadow-gray-400/50 hover:bg-gray-500  active:top-[0.5px] active:left-[0.5px]"
                            onClick={handleStop}
                        >
                            停止
                        </button>
                        {/* <button className="relative rounded-lg bg-orange-500 px-3 py-1 text-gray-50 shadow-lg shadow-orange-500/50 hover:shadow-orange-600/50 hover:bg-orange-600 active:top-[0.5px] active:left-[0.5px]">
                            暂停
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SavingWeiboPopup
