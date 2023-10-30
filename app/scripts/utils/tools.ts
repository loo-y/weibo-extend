import JSZip from 'jszip'
const FileSaver = require('file-saver')
import _ from 'lodash'
import { fetchToGetImageBlob, fetchToGetVideoBlobByXHR } from './fetches'

// watch Element by MutationObserver
export const watchElement = ({
    targetSelector,
    handleTarget,
}: {
    targetSelector: string
    handleTarget: (element: any) => void
}) => {
    if (!targetSelector) return

    // 创建一个 MutationObserver 实例
    const observer = new MutationObserver((mutationsList, observer) => {
        // 遍历每个变化记录
        for (let mutation of mutationsList) {
            // 检查添加的节点是否匹配目标选择器
            if (mutation.addedNodes) {
                // @ts-ignore
                for (let node of mutation.addedNodes) {
                    if (
                        node.matches &&
                        (node.matches(targetSelector) || node.querySelectorAll(targetSelector)?.length)
                    ) {
                        // 目标元素出现
                        handleTarget(node)
                    }
                }
            }
        }
    })

    // 监听整个文档的变化
    observer.observe(document, { childList: true, subtree: true })
}

// watchElement({
//     targetSelector: '.wbpro-list',
//     handleTarget: element => {
//         console.log(`target node`, element)
//     },
// })

export const sleep = (sec: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, sec * 1000)
    })
}

export const isSet = (variable: any): variable is Set<any> => {
    return variable instanceof Set
}

export const isType = <T>(value: unknown, targetType: new (...args: any[]) => T): value is T => {
    return value instanceof targetType
}

interface ISaveBlogToZipProps {
    myBlog: Record<string, any>[]
    start?: number
    attachedName?: string
    eachCallback?: (info: any) => void
}
export const saveBlogToZip = async ({ myBlog, start, attachedName, eachCallback }: ISaveBlogToZipProps) => {
    const zip = new JSZip()
    start = (start || 0) + 1
    let end = start - 1 + (myBlog?.length || 0)
    const range = `${start}_${end}`
    const userInfo = myBlog?.[0]?.user || {}
    const { screen_name, idstr } = userInfo || {}
    const zipFileName = _.compact([idstr, screen_name, attachedName, range]).join('_')

    const extensionId = chrome.runtime.id
    const weibSaveFolder = `chrome-extension://${extensionId}/weiboSave`
    const indexHtmlName = `index.html`,
        weibosaveJsName = `weibosave.js`,
        weibosaveCssName = `weibosave.css`
    const indexHtml = `${weibSaveFolder}/${indexHtmlName}`
    const weibosaveJs = `${weibSaveFolder}/scripts/${weibosaveJsName}`
    const weibosaveCss = `${weibSaveFolder}/style/${weibosaveCssName}`

    const [indexHtmlText, weibosaveJsText, weibosaveCssText] = await Promise.all([
        fetchFileStringFromExtension(indexHtml),
        fetchFileStringFromExtension(weibosaveJs),
        fetchFileStringFromExtension(weibosaveCss),
    ])
    const container = zip.folder(zipFileName) as JSZip
    container.file('index.html', indexHtmlText)
    const scriptsFolder = container.folder('scripts')
    scriptsFolder?.file(weibosaveJsName, weibosaveJsText)
    const styleFolder = container.folder('style')
    styleFolder?.file(weibosaveCssName, weibosaveCssText)
    await convertBlogList({ myBlog: myBlog, zipContainer: container, eachCallback })

    zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        FileSaver.saveAs(content, `${zipFileName}.zip`)
    })
}

const fetchFileStringFromExtension = async (fileUrl: string): Promise<any> => {
    const response = await fetch(fileUrl)
    const respText = await response.text()
    return respText
}

const convertBlogList = async ({
    myBlog,
    zipContainer,
    eachCallback,
}: ISaveBlogToZipProps & { zipContainer: JSZip; eachCallback?: (info: any) => void }): Promise<void> => {
    const imageFolder = zipContainer.folder('image')
    const videoFolder = zipContainer.folder('video')
    const userInfo = myBlog?.[0]?.user || {}
    let totalPicShowList: { picName: string; url: string }[] = []
    let finalList: typeof myBlog = []
    let _count = 0
    for (let blogItem of myBlog) {
        _count++
        let _count_pic_count = 0,
            _count_video_count = 0
        let mediaInfoList = [],
            retweeted_mediaInfoList = []
        let tempVideoList: Record<string, any>[] = []
        const {
            created_at,
            attitudes_count,
            attitudes_status,
            comments_count,
            id,
            idstr,
            mid,
            pic_ids,
            pic_infos,
            pic_num,
            region_name,
            source,
            text,
            text_raw,
            retweeted_status,
            page_info,
            reposts_count,
            mix_media_info,
            title,
        } = blogItem || {}

        if (!_.isEmpty(page_info?.media_info)) {
            tempVideoList.push(page_info.media_info)
        }

        let picShows =
            !pic_num || _.isEmpty(pic_infos)
                ? []
                : _.compact(
                      _.map(pic_infos, (picInfo, picKey) => {
                          const url = picInfo?.large?.url || undefined
                          if (!url) return undefined
                          return {
                              picName: matchImageFromUrl(url) || `${picKey}.jpg`,
                              url,
                          }
                      })
                  )
        if (!_.isEmpty(mix_media_info?.items)) {
            _.map(mix_media_info.items, item => {
                const { type, data } = item || {}
                if (type == `pic`) {
                    const url = data?.large?.url || undefined
                    picShows.push({
                        picName: matchImageFromUrl(url) || `${data?.pic_id}.jpg`,
                        url,
                    })
                }
                if (type == `video`) {
                    const _media_info = data?.media_info || {}
                    tempVideoList.push({
                        ..._media_info,
                    })
                }
            })
        }
        // totalPicShowList = totalPicShowList.concat(picShows)
        eachCallback &&
            eachCallback({
                weiboCount: _count,
                weiboPicCount: 0,
                weiboVideoCount: 0,
            })

        // 不能使用Promise.all 会被封调用
        for (let picShow of picShows) {
            _count_pic_count++
            eachCallback &&
                eachCallback({
                    weiboCount: _count,
                    weiboPicCount: _count_pic_count,
                })
            const picBlob = await fetchToGetImageBlob({ imageUrl: picShow?.url })
            if (picBlob) {
                imageFolder?.file(picShow.picName, picBlob)
            }
        }

        let retweetedBlog: Record<string, any> = {}
        if (!_.isEmpty(retweeted_status)) {
            let retweeted_status_picShows =
                !retweeted_status.pic_num || _.isEmpty(retweeted_status.pic_infos)
                    ? []
                    : _.compact(
                          _.map(retweeted_status.pic_infos, (picInfo, picKey) => {
                              const url = picInfo?.large?.url || undefined
                              if (!url) return undefined
                              return {
                                  picName: matchImageFromUrl(url) || `${picKey}.jpg`,
                                  url,
                              }
                          })
                      )
            if (!_.isEmpty(retweeted_status?.mix_media_info?.items)) {
                _.map(retweeted_status.mix_media_info.items, item => {
                    const { type, data } = item || {}
                    if (type == `pic`) {
                        const url = data?.large?.url || undefined
                        retweeted_status_picShows.push({
                            picName: matchImageFromUrl(url) || `${data?.pic_id}.jpg`,
                            url,
                        })
                    }
                    if (type == `video`) {
                        const _media_info = data?.media_info || {}
                        tempVideoList.push({
                            ..._media_info,
                        })
                    }
                })
            }

            // 不能使用Promise.all 会被封调用
            for (let retweetPicShow of retweeted_status_picShows) {
                _count_pic_count++
                eachCallback &&
                    eachCallback({
                        weiboCount: _count,
                        weiboPicCount: _count_pic_count,
                    })
                const picBlob = await fetchToGetImageBlob({ imageUrl: retweetPicShow?.url })
                if (picBlob) {
                    imageFolder?.file(retweetPicShow.picName, picBlob)
                }
            }
            const retweetFromUser = _.isEmpty(retweeted_status?.user)
                ? undefined
                : {
                      id: retweeted_status.user?.id,
                      idstr: retweeted_status.user?.idstr,
                      profile_url: retweeted_status.user?.profile_url,
                      profile_image_url: retweeted_status.user?.profile_image_url,
                      screen_name: retweeted_status.user?.screen_name,
                  }
            retweetedBlog = {
                reposts_count: retweeted_status.reposts_count,
                user: retweetFromUser,
                created_at: retweeted_status.created_at,
                attitudes_count: retweeted_status.attitudes_count,
                attitudes_status: retweeted_status.attitudes_status,
                comments_count: retweeted_status.comments_count,
                id: retweeted_status.id,
                mid: retweeted_status.mid,
                idstr: retweeted_status.idstr,
                pic_ids: retweeted_status.pic_ids,
                pic_infos: retweeted_status.pic_infos,
                picShows: retweeted_status_picShows,
                pic_num: retweeted_status.pic_num,
                region_name: retweeted_status.region_name, // 发布于XX
                source: retweeted_status.source, // 客户端
                text: retweeted_status.text,
                text_raw: retweeted_status.text_raw,
            }
        }

        // 视频
        if (!_.isEmpty(tempVideoList)) {
            console.log(`tempVideoList`, tempVideoList)
            for (let videoInfo of tempVideoList) {
                const { author_mid, h265_mp4_hd, mp4_720p_mp4, mp4_hd_url, media_id, format } = videoInfo || {}
                const videoUrl = h265_mp4_hd || mp4_720p_mp4 || mp4_hd_url
                _count_video_count++
                if (author_mid == mid) {
                    mediaInfoList.push({
                        format,
                        author_mid,
                        media_id,
                        url: videoUrl,
                    })
                } else if (author_mid == retweetedBlog?.mid) {
                    retweeted_mediaInfoList.push({
                        format,
                        author_mid,
                        media_id,
                        url: videoUrl,
                    })
                }

                eachCallback &&
                    eachCallback({
                        weiboCount: _count,
                        weiboVideoCount: _count_video_count,
                    })
                const videoFileName = `${media_id}.${format}`
                // const videoBlob = await fetchToGetVideoBlob({ videoUrl: videoUrl })
                const videoBlob = await fetchToGetVideoBlobByXHR({ videoUrl })
                if (videoBlob) {
                    videoFolder?.file(videoFileName, videoBlob)
                }
            }
        }

        if (!_.isEmpty(retweeted_mediaInfoList) && !_.isEmpty(retweetedBlog)) {
            if (_.isEmpty(retweetedBlog.mediaInfoList)) {
                retweetedBlog.mediaInfoList = retweeted_mediaInfoList
            } else {
                retweetedBlog.mediaInfoList = retweetedBlog.mediaInfoList.conat(retweeted_mediaInfoList)
            }
        }

        finalList.push({
            reposts_count, // 转发数
            created_at, // 创建时间
            attitudes_count, // 点赞数
            attitudes_status,
            comments_count, // 回复数
            id,
            idstr,
            mid,
            pic_ids,
            pic_infos,
            picShows,
            pic_num,
            region_name, // 发布于XX
            source, // 客户端
            text,
            text_raw,
            retweetedBlog,
            mediaInfoList,
            title: title?.text ? { text: title.text } : undefined,
        })
    }

    // 下载用户头像
    const userPicUrl = userInfo?.avatar_hd || userInfo?.profile_image_url || userInfo?.avatar_large || undefined
    if (userPicUrl) {
        userInfo.picShow = matchImageFromUrl(userPicUrl)
        const picBlob = await fetchToGetImageBlob({ imageUrl: userPicUrl })
        if (picBlob) {
            imageFolder?.file(userInfo.picShow, picBlob)
        }
    }
    zipContainer.file(
        'myblog.js',
        `window.myblog={"user": ${JSON.stringify(userInfo)},"list": ${JSON.stringify(finalList)}}`
    )

    // if (!_.isEmpty(totalPicShowList)) {
    //     const imageFolder = zipContainer.folder('image')
    //     // 不能使用Promise.all 会被封调用
    //     for (let picShow of totalPicShowList) {
    //         const picBlob = await fetchToGetImageBlob({ imageUrl: picShow?.url })
    //         if (picBlob) {
    //             imageFolder?.file(picShow.picName, picBlob)
    //         }
    //     }
    // }
}

// getPackageDirectoryEntry is Foreground only, like in popup.html
const getFileStringFromExtension = async (): Promise<Blob> => {
    const errorHandler = (e: any) => {
        console.log(`errorHandler`, e)
    }
    return new Promise((resolve, reject) => {
        // @ts-ignore
        chrome.runtime.getPackageDirectoryEntry(function (root) {
            root.getFile(
                'weiboSave/index.html',
                {},
                function (fileEntry: any) {
                    fileEntry.file(function (file: any) {
                        var reader = new FileReader()
                        reader.onloadend = function (e) {
                            // contents are in this.result
                            console.log(`reader`, e)
                        }
                        const fileInfo = reader.readAsText(file)
                        console.log(`fileInfo`, fileInfo)
                        // @ts-ignore
                        resolve(fileInfo)
                    }, errorHandler)
                },
                errorHandler
            )
        })
    })
}

const matchImageFromUrl = (url: string) => {
    return url?.match(/\/([\da-zA-Z]+\.[a-z]{3,4})(\?|$)/)?.[1] || ''
}
