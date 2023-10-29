import JSZip from 'jszip'
const FileSaver = require('file-saver')
import _ from 'lodash'
import { fetchToGetImageBlob, fetchToGetVideoBlob } from './fetches'

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
    eachCallback?: (info: any) => void
}
export const saveBlogToZip = async ({ myBlog, start, eachCallback }: ISaveBlogToZipProps) => {
    const zip = new JSZip()
    start = start || 1
    let end = start + (myBlog?.length || 0)
    const range = `${start}_${end}`
    const userInfo = myBlog?.[0]?.user || {}
    const { screen_name, idstr } = userInfo || {}
    const zipFileName = `${idstr}_${screen_name}_${range}`

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
    let totalPicShowList: { picName: string; url: string }[] = []
    let finalList: typeof myBlog = []
    let _count = 0
    for (let blogItem of myBlog) {
        _count++

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
        } = blogItem || {}
        const picShows =
            !pic_num || _.isEmpty(pic_infos)
                ? []
                : _.compact(
                      _.map(pic_infos, (picInfo, picKey) => {
                          const url = picInfo?.large?.url || undefined
                          if (!url) return undefined
                          return {
                              picName: url.match(/\/([\da-zA-Z]+\.[a-z]{3,4})$/)?.[1] || `${picKey}.jpg`,
                              url,
                          }
                      })
                  )
        // totalPicShowList = totalPicShowList.concat(picShows)
        eachCallback &&
            eachCallback({
                weiboCount: _count,
                weiboPicCount: 0,
                weiboVideoCount: 0,
            })
        let _count_pic_count = 0
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

        let mediaInfoList = []
        // 视频
        if (!_.isEmpty(page_info?.media_info)) {
            const { author_mid, h265_mp4_hd, mp4_720p_mp4, mp4_hd_url, media_id, format } = page_info?.media_info || {}
            const downloadUrl = h265_mp4_hd || mp4_720p_mp4 || mp4_hd_url
            mediaInfoList.push({
                format,
                author_mid,
                media_id,
                url: downloadUrl,
            })
            eachCallback &&
                eachCallback({
                    weiboCount: _count,
                    weiboVideoCount: 1,
                })
            const videoBlob = await fetchToGetVideoBlob({ videoUrl: downloadUrl })
            if (videoBlob) {
                videoFolder?.file(`${media_id}.${format}`, videoBlob)
            }
        }

        let retweetedBlog = {}
        if (!_.isEmpty(retweeted_status)) {
            const retweeted_status_picShows =
                !retweeted_status.pic_num || _.isEmpty(retweeted_status.pic_infos)
                    ? []
                    : _.compact(
                          _.map(retweeted_status.pic_infos, (picInfo, picKey) => {
                              const url = picInfo?.large?.url || undefined
                              if (!url) return undefined
                              return {
                                  picName: url.match(/\/([\da-zA-Z]+\.[a-z]{3,4})$/)?.[1] || `${picKey}.jpg`,
                                  url,
                              }
                          })
                      )
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

        finalList.push({
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
        })
    }

    zipContainer.file('myblog.js', `window.myblog={"list": ${JSON.stringify(finalList)}}`)

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
