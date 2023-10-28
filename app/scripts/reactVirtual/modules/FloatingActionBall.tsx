import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getWeiboExtendState, updateShowFloatingPopup } from '../slice'
import SvgComp from '../components/SvgComp'
import FloatingPopup from './FloatingPopup'

const FloatingActionBall: React.FC = () => {
    const state = useAppSelector(getWeiboExtendState)
    const dispatch = useAppDispatch()
    const { showFloatingPopup } = state || {}

    const handleClick = () => {
        dispatch(updateShowFloatingPopup(!showFloatingPopup))
    }

    return (
        <div className="fixed cursor-pointer w-9 h-9 bg-transparent z-[999] bottom-36 [@media(min-width:872px)]:left-1/2 [@media(max-width:1162px)]:ml-[426px] [@media(min-width:1162px)]:ml-[571px] [@media(max-width:872px)]:right-0 ">
            <div onClick={handleClick}>
                <ToolSettingSvg
                    asImg={true}
                    className="w-9 h-9 rounded-2xl overflow-hidden shadow-lg shadow-red-500/50 hover:shadow-red-600/50 active:shadow-red-400/50 active:mt-[0.5px] active:ml-[0.5px]"
                />
            </div>
            <FloatingPopup />
        </div>
    )
}

export default FloatingActionBall

interface IToolSettingSvgProps {
    asImg?: boolean
    className?: string
}

const ToolSettingSvg = ({ asImg, className }: IToolSettingSvgProps) => {
    return <SvgComp asImg={asImg} className={className} svgString={svgString} />
}

const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" width="256" height="256"><defs><linearGradient id="a"><stop offset="0" stop-color="#ff1679" class="stopColorff1679 svgShape"></stop><stop offset="1" stop-color="#ff770b" class="stopColorff770b svgShape"></stop></linearGradient><linearGradient id="b" x1="992.183" x2="1019.298" y1="516.081" y2="545.959" gradientTransform="translate(-1015.137 491.682) scale(1.02524)" gradientUnits="userSpaceOnUse" xlink:href="#a"></linearGradient></defs><g transform="translate(0 -1020.362)" fill="#000000" class="color000 svgShape"><rect width="32" height="32" y="1020.362" fill="url(#b)" rx="6.763" ry="6.763"></rect><path fill="#ffffff" style="text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb" d="M14.656 8a.5.5 0 0 0-.406.438L14.062 10c-.326.105-.632.25-.937.406l-1.219-.969a.5.5 0 0 0-.687.032l-1.75 1.75a.5.5 0 0 0-.031.656l.968 1.25c-.156.305-.27.611-.375.938l-1.594.187a.5.5 0 0 0-.437.5v2.5a.5.5 0 0 0 .438.5l1.562.188c.106.326.25.632.406.937l-.969 1.219a.5.5 0 0 0 .032.687l1.75 1.75a.5.5 0 0 0 .687.032l1.219-.97c.305.157.611.27.938.376l.187 1.593a.5.5 0 0 0 .5.438h2.5a.5.5 0 0 0 .5-.438L17.938 22c.326-.106.632-.25.937-.406l1.219.968a.5.5 0 0 0 .687-.03l1.75-1.75a.5.5 0 0 0 .063-.688l-1-1.219a6.28 6.28 0 0 0 .406-.938l1.563-.187a.5.5 0 0 0 .437-.5v-2.5a.5.5 0 0 0-.438-.5L22 14.062a6.265 6.265 0 0 0-.406-.937l1-1.219a.5.5 0 0 0-.063-.687l-1.75-1.75a.5.5 0 0 0-.687-.031l-1.219.968a6.265 6.265 0 0 0-.938-.406l-.187-1.563a.5.5 0 0 0-.5-.437h-2.5a.5.5 0 0 0-.094 0zm.531 1h1.626l.156 1.406a.5.5 0 0 0 .375.438c.48.124.916.31 1.343.562a.5.5 0 0 0 .594-.031l1.094-.875 1.156 1.125-.906 1.125a.5.5 0 0 0-.031.563c.252.427.437.863.562 1.343a.5.5 0 0 0 .438.375l1.406.156v1.626l-1.406.156a.5.5 0 0 0-.438.375c-.124.48-.31.947-.562 1.375a.5.5 0 0 0 .031.562l.906 1.094-1.156 1.156-1.094-.906a.5.5 0 0 0-.593-.031 5.161 5.161 0 0 1-1.344.562.5.5 0 0 0-.375.438L16.812 23h-1.625l-.156-1.406a.5.5 0 0 0-.375-.438 5.163 5.163 0 0 1-1.344-.562.5.5 0 0 0-.593.031l-1.094.906-1.156-1.156.906-1.094a.5.5 0 0 0 .031-.562 5.368 5.368 0 0 1-.562-1.375.5.5 0 0 0-.438-.375L9 16.812v-1.625l1.406-.156a.5.5 0 0 0 .438-.375c.124-.48.31-.916.562-1.344a.5.5 0 0 0-.031-.562l-.906-1.125 1.156-1.125 1.094.875a.5.5 0 0 0 .594.031 5.16 5.16 0 0 1 1.343-.562.5.5 0 0 0 .375-.438L15.187 9zM16 12c-2.203 0-4 1.797-4 4 0 2.203 1.797 4 4 4 2.203 0 4-1.797 4-4 0-2.203-1.797-4-4-4zm0 1c1.663 0 3 1.337 3 3s-1.337 3-3 3-3-1.337-3-3 1.337-3 3-3z" color="#000" font-family="sans-serif" font-weight="400" overflow="visible" transform="translate(0 1020.362)" class="colorfff svgShape"></path></g></svg>
`
