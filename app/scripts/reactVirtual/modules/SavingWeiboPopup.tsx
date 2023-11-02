'use client'
import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import DatepickerComp from '../components/DatepickerComp'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getWeiboExtendState, updateState, saveWeiboQueue } from '../slice'
import { WeiboPopType } from '../interface'
import dayjs from 'dayjs'

const SavingWeiboPopup = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const {
        showWeiboPop,
        totalCountSaveingWeibo,
        currentSavingWeiboCount,
        currentSavingWeiboPicCount,
        currentSavingWeiboVideoCount,
        savingUid,
    } = state || {}
    const [savingStartDate, setSavingStartDate] = useState<Date | undefined>(undefined)
    const [savingEndDate, setSavingEndDate] = useState<Date | undefined>(undefined)
    const [savingType, setSavingType] = useState(-1)

    const handleStop = () => {
        dispatch(updateState({ showWeiboPop: WeiboPopType.stop }))
    }

    const handleYesStop = () => {
        dispatch(
            updateState({
                stopSaving: true,
                totalCountSaveingWeibo: 0,
                currentSavingWeiboCount: 0,
                showWeiboPop: WeiboPopType.hidden,
            })
        )
    }

    const handleCancelStop = () => {
        dispatch(updateState({ showWeiboPop: WeiboPopType.saving }))
    }

    const handleSelectSaveingType = (type: number) => {
        console.log(`handleSelectSaveingType`, type)
        setSavingType(type)
    }

    const handleClose = () => {
        dispatch(
            updateState({
                stopSaving: true,
                totalCountSaveingWeibo: 0,
                currentSavingWeiboCount: 0,
                showWeiboPop: WeiboPopType.hidden,
            })
        )
    }

    const handleConfirmSavingType = () => {
        if (![0, 1].includes(savingType)) {
            alert(`请先选择保存类型`)
        } else if (savingType == 0) {
            // 全部
            setSavingStartDate(undefined)
            setSavingEndDate(undefined)
            dispatch(saveWeiboQueue({ uid: savingUid }))
        } else {
            if (!savingStartDate || !savingEndDate) {
                alert(`请先选择日期`)
            } else {
                const today = dayjs().hour(23).minute(59).second(59).millisecond(999).valueOf()
                const startDateTime = dayjs(savingStartDate).valueOf()
                const endDateTime = dayjs(savingEndDate).valueOf()
                if (startDateTime > today) {
                    alert(`开始日期不能大于今天`)
                } else if (endDateTime > today) {
                    alert(`结束日期不能大于今天`)
                } else if (endDateTime < startDateTime) {
                    alert(`开始日期不能大于结束日期`)
                } else {
                    dispatch(
                        saveWeiboQueue({
                            uid: savingUid,
                            startDate: savingStartDate,
                            endDate: savingEndDate,
                        })
                    )
                }
            }
        }
    }

    const handleGetSavingStartDate = (startDate: Date) => {
        console.log(startDate)
        setSavingStartDate(startDate)
    }

    const handleGetSavingEndDate = (endDate: Date) => {
        console.log(endDate)
        setSavingEndDate(endDate)
    }

    if (showWeiboPop == WeiboPopType.typeSelect) {
        return (
            <div className="flex fixed p-4 inset-0 bg-black bg-opacity-30 z-[9999]">
                <div className="bg-white absolute right-[5rem] top-[5rem] rounded-xl h-[14rem] w-[28rem] py-4 pl-8 pr-6 flex flex-col text-gray-500 gap-2">
                    <div className="title flex w-full text-lg font-bold flex-row gap-2 mt-2">
                        <span className="">{`备份微博`}</span>
                    </div>
                    <div className="flex flex-row  text-sm gap-5 mt-2">
                        <div className="flex items-center ">
                            <input
                                type="radio"
                                className="cursor-pointer"
                                name="saving_type"
                                id="saving_type_all"
                                value="0"
                                checked={savingType == 0}
                                onChange={() => {
                                    handleSelectSaveingType(0)
                                }}
                            ></input>
                            <label htmlFor="saving_type_all" className="ml-1 cursor-pointer">
                                全部
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                className="cursor-pointer"
                                name="saving_type"
                                id="saving_type_bydate"
                                value="1"
                                checked={savingType == 1}
                                onChange={() => {
                                    handleSelectSaveingType(1)
                                }}
                            ></input>
                            <label htmlFor="saving_type_bydate" className="ml-1 cursor-pointer">
                                按日期
                            </label>
                        </div>
                    </div>
                    {savingType == 1 ? (
                        <div className="flex flex-row text-sm gap-5 mt-2 items-center">
                            <DatepickerComp
                                title={`开始日期`}
                                callback={handleGetSavingStartDate}
                                defaultSelectedDate={savingStartDate}
                            />
                            <div className="flex">
                                <span>至</span>
                            </div>
                            <DatepickerComp
                                title={`截止日期`}
                                callback={handleGetSavingEndDate}
                                defaultSelectedDate={savingEndDate}
                            />
                        </div>
                    ) : null}
                    <div className="absolute bottom-6 right-6 flex mt-3 w-full item-center justify-end">
                        <div className="flex flex-row gap-6">
                            <button
                                className="relative rounded-lg bg-gray-400 px-3 py-1 text-gray-50 shadow-lg shadow-gray-400/50 hover:shadow-gray-400/50 hover:bg-gray-500  active:top-[0.5px] active:left-[0.5px]"
                                onClick={handleClose}
                            >
                                关闭
                            </button>
                            <button
                                className="relative rounded-lg bg-orange-500 px-3 py-1 text-gray-50 shadow-lg shadow-orange-500/50 hover:shadow-orange-600/50 hover:bg-orange-600 active:top-[0.5px] active:left-[0.5px]"
                                onClick={handleConfirmSavingType}
                            >
                                确认
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (showWeiboPop == WeiboPopType.stop) {
        return (
            <div className="flex fixed p-4 inset-0 bg-black bg-opacity-30 z-[9999]">
                <div className="bg-white absolute right-[5rem] top-[5rem] rounded-xl h-[14rem] w-[28rem] py-4 pl-8 pr-6 flex flex-col text-gray-500 gap-2">
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

    if (showWeiboPop == WeiboPopType.completed) {
        return (
            <div className="flex fixed p-4 inset-0 bg-black bg-opacity-30 z-[9999]">
                <div className="bg-white absolute right-[5rem] top-[5rem] rounded-xl h-[14rem] w-[28rem] py-4 pl-8 pr-6 flex flex-col text-gray-500 gap-2">
                    <div className="title flex w-full text-lg font-bold flex-row gap-2 mt-2">
                        <span className="">{`已备份完成`}</span>
                    </div>
                    <div className="flex ml-1 mt-1 subtitle flex-row w-full text-xs text-gray-800 text-opacity-70 gap-2">
                        <div className="">
                            <span>
                                {currentSavingWeiboCount
                                    ? `共备份${currentSavingWeiboCount}条微博`
                                    : `备份微博总数：未知`}
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-6 right-6 flex mt-3 w-full item-center justify-end">
                        <div className="flex flex-row gap-6">
                            <button
                                className="relative cursor-pointer rounded-lg bg-orange-500 px-3 py-1 text-gray-50 shadow-lg shadow-orange-500/50 hover:shadow-orange-600/50 hover:bg-orange-600 active:top-[0.5px] active:left-[0.5px]"
                                onClick={handleClose}
                            >
                                好的
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    if (showWeiboPop == WeiboPopType.saving || showWeiboPop == WeiboPopType.savingFav) {
        return (
            <div className="flex fixed p-4 inset-0 bg-black bg-opacity-30 z-[9999]">
                <div className="bg-white absolute right-[5rem] top-[5rem] rounded-xl h-[14rem] w-[28rem] py-4 pl-8 pr-6 flex flex-col text-gray-500 gap-2">
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
                        <div className="">
                            <span>
                                {totalCountSaveingWeibo ? `一共${totalCountSaveingWeibo}条微博` : `当前微博总数：未知`}
                            </span>
                        </div>
                        {currentSavingWeiboCount ? (
                            <div className="before:content-['|'] before:mr-2 before:text-gray-600 before:text-opacity-30 ">
                                <span>{`正在备份第${currentSavingWeiboCount || 'X'}条`}</span>
                            </div>
                        ) : null}
                        {currentSavingWeiboVideoCount ? (
                            <div className="before:content-['|'] before:mr-2 before:text-gray-600 before:text-opacity-30 ">
                                <span>{`正在下载第${currentSavingWeiboVideoCount}个视频`}</span>
                            </div>
                        ) : currentSavingWeiboPicCount ? (
                            <div className="before:content-['|'] before:mr-2 before:text-gray-600 before:text-opacity-30 ">
                                <span>{`正在下载第${currentSavingWeiboPicCount}张图片`}</span>
                            </div>
                        ) : null}
                    </div>

                    <div className="absolute bottom-6 right-6 flex mt-3 w-full item-center justify-end">
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

    return null
}

export default SavingWeiboPopup
