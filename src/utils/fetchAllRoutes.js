import { getAllRoute } from '@/api/getAll'

export const fetchRoutesIfNeeded = async (forceUpdate = false) => {
    const today = new Date().toLocaleDateString()
    const cachedRoutes = localStorage.getItem('stored_data_routes')
    const routes = cachedRoutes ? JSON.parse(cachedRoutes) : null

    let background = false // 在函数内定义 background

    if (!forceUpdate && routes && routes.version === today) {
        console.log("今天已经获取过数据")
        return
    }

    if (routes && routes.version !== today && forceUpdate == false) {
        background = true
    }

    try {
        const newRoutes = await getAllRoute()  // 调用 getAllRoute 方法获取最新的路由数据
        console.log("🚩 ~ fetchRoutesIfNeeded ~ routes 👇\n", newRoutes)

        if (newRoutes.lineinfos && newRoutes.lineinfos.length > 0) {
            newRoutes.version = today
            localStorage.setItem('stored_data_routes', JSON.stringify(newRoutes)) // 更新缓存
            if (background) {
                const event = new CustomEvent('routesDataBackgroundUpdated', { detail: { date: today } })
                window.dispatchEvent(event)
            }
        } else {
            if (background) {
                const event = new CustomEvent('routesDataBackgroundUpdateFailed', { detail: { date: today } })
                window.dispatchEvent(event)
            }
            throw new Error('路由数据不完整')
        }
    } catch (error) {
        if (background) {
            const event = new CustomEvent('routesDataBackgroundUpdateFailed', { detail: { date: today } })
            window.dispatchEvent(event)
        }
        console.error('Failed to fetch routes:', error)
        throw error  // 抛出错误，让调用方处理
    }
}
