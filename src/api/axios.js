import axios from 'axios'
import pako from 'pako'
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
    timeout: 10000, // 请求超时时间
    headers: {
        'isazhuapp': 'true',
    },
})

const getAll = axios.create({
    baseURL: import.meta.env.VITE_BASE_GET_ALL_API || '',
    timeout: 10000, // 请求超时时间
    headers: {
        'isazhuapp': 'true',
    },
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
    if (response?.headers['is-compressed'] == 'true') {
        try {
            // 如果响应数据是 Base64 字符串，先进行解码和解压缩
            const compressedData = response.data
            if (typeof compressedData === 'string') {
                const binaryString = atob(compressedData)
                const binaryData = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                    binaryData[i] = binaryString.charCodeAt(i)
                }
                const decompressedData = pako.inflate(binaryData, { to: 'string' })
                return JSON.parse(decompressedData)
            }
            // 如果数据不是压缩数据，直接返回原始数据
            return response.data
        } catch (error) {
            console.error("解压缩响应数据时出错:", error)
            return Promise.reject(error)
        }
    } else {
        return response.data
    }
}

const errorResponseInterceptor = (error) => {
    return Promise.reject(error)
}

// 为每个实例添加拦截器
wechatHttp.interceptors.request.use(requestInterceptor, errorRequestInterceptor)
wechatHttp.interceptors.response.use(responseInterceptor, errorResponseInterceptor)

webHttp.interceptors.request.use(requestInterceptor, errorRequestInterceptor)
webHttp.interceptors.response.use(responseInterceptor, errorResponseInterceptor)

getAll.interceptors.request.use(requestInterceptor, errorRequestInterceptor)
getAll.interceptors.response.use(responseInterceptor, errorResponseInterceptor)

export { wechatHttp, webHttp, getAll }
