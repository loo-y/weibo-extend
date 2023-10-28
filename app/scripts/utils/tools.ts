import JSZip from 'jszip'
const FileSaver = require('file-saver')
import _ from 'lodash'
import { fetchToGetImageBlob } from './fetches'

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
}
export const saveBlogToZip = async ({ myBlog }: ISaveBlogToZipProps) => {
    const zip = new JSZip()

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
    const container = zip.folder('weiboSave') as JSZip
    container.file('index.html', indexHtmlText)
    const scriptsFolder = container.folder('scripts')
    scriptsFolder?.file(weibosaveJsName, weibosaveJsText)
    const styleFolder = container.folder('style')
    styleFolder?.file(weibosaveCssName, weibosaveCssText)
    await convertBlogList({ myBlog: myBlog, zipContainer: container })
    // container.file('myblog.js', `window.myblog={"list": ${JSON.stringify(myBlog)}}`)
    zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        FileSaver.saveAs(content, 'weiboSave.zip')
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
}: ISaveBlogToZipProps & { zipContainer: JSZip }): Promise<void> => {
    let totalPicShowList: { picName: string; url: string }[] = []
    const finalList = _.map(myBlog, blogItem => {
        const {
            created_at,
            attitudes_count,
            attitudes_status,
            comments_count,
            id,
            idStr,
            pic_ids,
            pic_infos,
            pic_num,
            region_name,
            source,
            text,
            text_raw,
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
        totalPicShowList = totalPicShowList.concat(picShows)

        return {
            created_at, // 创建时间
            attitudes_count, // 点赞数
            attitudes_status,
            comments_count, // 回复数
            id,
            idStr,
            pic_ids,
            pic_infos,
            picShows,
            pic_num,
            region_name, // 发布于XX
            source, // 客户端
            text,
            text_raw,
        }
    })

    zipContainer.file('myblog.js', `window.myblog={"list": ${JSON.stringify(finalList)}}`)

    if (!_.isEmpty(totalPicShowList)) {
        // TODO 方便测试只下载一张
        const allPicsDownloads = await Promise.all([fetchToGetImageBlob({ imageUrl: totalPicShowList[0]?.url })])
        const imageFolder = zipContainer.folder('image')
        _.each(allPicsDownloads, (picBolb, index) => {
            if (picBolb) {
                imageFolder?.file(totalPicShowList[index].picName, picBolb)
            }
        })
    }
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
