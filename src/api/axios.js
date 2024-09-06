import axios from 'axios'

// 创建 WeChat API 的 axios 实例
const wechatHttp = axios.create({
    baseURL: import.meta.env.VITE_BASE_API_WECHAT || '',
    timeout: 10000, // 请求超时时间
    headers: {
        'isazhuapp': 'true',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
})

// 创建 Web API 的 axios 实例
const webHttp = axios.create({
    baseURL: import.meta.env.VITE_BASE_API_WEB || '',
    timeout: 20000, // 请求超时时间
})

// 请求拦截器
const requestInterceptor = (config) => {
    return config
}

const errorRequestInterceptor = (error) => {
    return Promise.reject(error)
}

// 响应拦截器
const responseInterceptor = (response) => {
    return response.data
}

const errorResponseInterceptor = (error) => {
    return Promise.reject(error)
}

// 为每个实例添加拦截器
wechatHttp.interceptors.request.use(requestInterceptor, errorRequestInterceptor)
wechatHttp.interceptors.response.use(responseInterceptor, errorResponseInterceptor)

webHttp.interceptors.request.use(requestInterceptor, errorRequestInterceptor)
webHttp.interceptors.response.use(responseInterceptor, errorResponseInterceptor)

export { wechatHttp, webHttp }
