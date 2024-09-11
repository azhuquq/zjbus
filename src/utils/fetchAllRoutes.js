import { getAllRoute } from '@/api/getAll'

export const fetchRoutesIfNeeded = async () => {
    const today = new Date().toLocaleDateString()
    const cachedRoutes = localStorage.getItem('routes')
    const routes = cachedRoutes ? JSON.parse(cachedRoutes) : null
    if (routes && routes.version === today) {
        console.log("今天已经获取过数据")
        return
    }
    try {
        const newRoutes = await getAllRoute()  // 调用 getAllRoute 方法获取路由数据
        console.log("🚩 ~ fetchRoutesIfNeeded ~ routes 👇\n", newRoutes)
        if (newRoutes.lineinfos && newRoutes.lineinfos.length > 0) {
            newRoutes.version = today
            localStorage.setItem('routes', JSON.stringify(newRoutes))
        }
    } catch (error) {
        console.error('Failed to fetch routes:', error)
    }
}
