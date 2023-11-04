// Access-Control-Allow-Origin 在使用通配符 * 时，只能单独出现
// 即： 'Access-Control-Allow-Origin': '*'
// 而这种写法是不被允许的： 'Access-Control-Allow-Origin': 'https://*.weibo.com',
const allowOrigin = {
    'Access-Control-Allow-Origin': 'https://weibo.com',
}

const corsHeaders = {
    ...allowOrigin,
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

function handleOptions(request) {
    if (
        request.headers.get('Origin') !== null &&
        request.headers.get('Access-Control-Request-Method') !== null &&
        request.headers.get('Access-Control-Request-Headers') !== null
    ) {
        // Handle CORS pre-flight request.
        return new Response(null, {
            headers: corsHeaders,
        })
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, POST, PUT, OPTIONS',
            },
        })
    }
}

addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request))
})

async function fetchAndApply(request) {
    if (request.method === 'OPTIONS') {
        return handleOptions(request)
    }

    let response
    try {
        const imageUrl = new URL(request.url).searchParams.get('url') // 从查询参数中获取图片地址

        // 获取图片数据
        const response = await fetch(imageUrl)
        const imageBuffer = await response.arrayBuffer()

        // 设置响应头部为图片类型，并允许跨域请求
        const headers = {
            'Content-Type': response.headers.get('content-type'),
            ...allowOrigin,
        }

        // 构造响应对象
        const imageResponse = new Response(imageBuffer, { headers })

        return imageResponse
    } catch (error) {
        console.error('Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
