// @ts-ignore
import $ from 'jquery'
import _ from 'lodash'
import { UserType } from './interface'
export const showUserList = ({ userList }: { userList?: UserType[] }) => {
    if (_.isEmpty(userList)) return

    const userShowList: string[] = _.map(userList, userInfo => {
        const { uid, avatar, title } = userInfo || {}
        return `
            <div class="normal-js">
                <img src="${avatar}" alt="${title}" />
                <a href=${
                    /\d+/.test(uid) ? '//weibo.com/u/' + uid : '//weibo.com/' + uid
                } target="_blank"><span>${title}</span></a>
            </div>
        `
    })

    $('body').append(`<div>${userShowList.join('')}</div>`)
}
