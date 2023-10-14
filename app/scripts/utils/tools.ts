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