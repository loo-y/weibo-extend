import _ from 'lodash'

const commonOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
}

// example
export const fetchCount = async ({ count }: { count: number }) => {
    let data = null,
        status = false
    try {
        const response = await fetch('/api/count', {
            ...commonOptions,
            body: JSON.stringify({ count }),
        })
        if (!response.ok) {
            // throw new Error(response.statusText)
            return {
                status,
                data,
            }
        }
        data = await response.json()
        status = true
    } catch (e) {
        console.log(`fetchPoems`, e)
    }

    return {
        data,
        status,
    }
}
