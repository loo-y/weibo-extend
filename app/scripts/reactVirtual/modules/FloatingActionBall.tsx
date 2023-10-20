import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { useAppSelector, useAppDispatch } from '../hooks'
import { blockUser, unblockUser, getWeiboExtendState, clearRequestQueue } from '../slice'
import ToolSettingSvg from './ToolSettingSvg'

const FloatingActionBall: React.FC = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()

    return (
        <div className="fixed cursor-pointer w-9 h-9 bg-transparent z-[999] bottom-36 [@media(min-width:872px)]:left-1/2 [@media(max-width:1162px)]:ml-[426px] [@media(min-width:1162px)]:ml-[571px] [@media(max-width:872px)]:right-0 ">
            <div>
                <ToolSettingSvg
                    asImg={true}
                    className="w-9 h-9 rounded-2xl overflow-hidden shadow-lg shadow-red-500/50 hover:shadow-red-400/50 hover:mt-[0.5px] hover:ml-[0.5px]"
                />
            </div>
        </div>
    )
}

export default FloatingActionBall
