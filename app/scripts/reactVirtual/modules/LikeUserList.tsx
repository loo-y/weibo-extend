import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { useAppSelector, useAppDispatch } from '../hooks'
import { blockUser, unblockUser, getWeiboExtendState, clearRequestQueue } from '../slice'
import { UserType } from '../interface'

const LikeUserList: React.FC = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const { blackUserList, blackLikeText } = state || {}
    const [displayUserList, setDisplayUserList] = useState<UserType[]>([])
    const [displayLikeText, setDisplayLikeText] = useState<string>('')
    useEffect(() => {
        setDisplayUserList(blackUserList || [])
        setDisplayLikeText(blackLikeText || '')
    }, [blackUserList])
    console.log(`blackUserList`, blackUserList)

    const handleUserClick = (userInfo: UserType) => {
        const { uid, avatar, title } = userInfo || {}
        const url = /\d+/.test(uid) ? '//weibo.com/u/' + uid : '//weibo.com/' + uid
        window.open(url, '_blank')
    }

    const handleClose = () => {
        setDisplayUserList([])
    }

    const handleBlockUsers = () => {
        if (!_.isEmpty(displayUserList)) {
            dispatch(clearRequestQueue())
            _.each(displayUserList, user => {
                dispatch(blockUser({ uid: user.uid }))
            })
        }
    }

    const handleUnBlockUsers = () => {
        if (!_.isEmpty(displayUserList)) {
            dispatch(clearRequestQueue())
            _.each(displayUserList, user => {
                dispatch(unblockUser({ uid: user.uid }))
            })
        }
    }
    if (_.isEmpty(displayUserList)) return null

    return (
        <div className="fixed flex flex-col gap-3 w-96 bottom-32 right-[2rem] z-[999] bg-gray-900 shadow-xl rounded-2xl text-sm pt-4 pb-3">
            <div
                className=" absolute top-3 right-3 cursor-pointer text-slate-100 hover:text-slate-400 font-semibold"
                onClick={handleClose}
            >
                关闭
            </div>
            <div className="title mb-3 border-0 border-b-2 h-[3.25rem] mt-6 border-slate-400 border-solid text-slate-100 font-bold">
                <div className=" ml-3">
                    {`以下用户点赞了：`}
                    <div title={displayLikeText} className="line-clamp-1 font-normal text-slate-300 italic">
                        {displayLikeText}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 px-3  max-h-[38rem] overflow-scroll">
                {_.map(displayUserList, (userInfo, usr_index) => {
                    const { uid, avatar, title, isBlocked } = userInfo || {}

                    return (
                        <div className="flex flex-row justify-between  items-center " key={`userlist_${usr_index}`}>
                            <div
                                className="flex flex-row gap-1 cursor-pointer items-center  text-orange-300 hover:text-orange-500"
                                onClick={() => {
                                    handleUserClick(userInfo)
                                }}
                            >
                                <img
                                    src={avatar}
                                    alt={title}
                                    className=" w-[50px] h-[50px] overflow-hidden rounded-full"
                                />
                                <span>{title}</span>
                            </div>
                            {isBlocked === undefined ? null : (
                                <div className="ml-auto flex item-center justify-end text-slate-100 font-semibold">
                                    {isBlocked ? '已拉黑' : '已解除屏蔽'}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="bottom_buttons h-10 flex flex-row justify-center font-bold mt-3">
                <div className=" w-1/2 flex items-center  justify-center">
                    <div
                        className=" flex items-center justify-center cursor-pointer bg-slate-300 hover:bg-slate-200 rounded-xl h-8 w-32 align-middle text-center"
                        onClick={handleBlockUsers}
                    >
                        一键拉黑
                    </div>
                </div>
                <div className="w-1/2 flex items-center  justify-center">
                    <div
                        className="flex items-center justify-center cursor-pointer bg-slate-300 hover:bg-slate-200 rounded-xl h-8 w-32 align-middle text-center"
                        onClick={handleUnBlockUsers}
                    >
                        解除拉黑
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LikeUserList
