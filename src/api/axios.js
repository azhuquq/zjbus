import axios from 'axios'
import pako from 'pako'  // 用于解压缩 gzip 数据
import base64js from 'base64-js'  // 用于解码 Base64 数据

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

// 响应拦截器，处理 gzip + Base64 的数据
const responseInterceptor = (response) => {
    // 如果响应包含 gzip 压缩并且是 Base64 编码的数据
    if (response.headers['content-encoding'] === 'gzip' && response.data) {
        try {
            // 1. 首先对 Base64 数据进行解码
            const base64Data = base64js.toByteArray(response.data)
            // 2. 然后使用 pako 对解码后的数据进行 gzip 解压缩
            const decompressedData = pako.inflate(base64Data, { to: 'string' })
            // 3. 返回解压后的 JSON 数据
            return JSON.parse(decompressedData)
        } catch (error) {
            console.error('数据解压缩或解析失败: ', error)
            return Promise.reject(error)
        }
    }
    
    // 正常返回未压缩的数据
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

getAll.interceptors.request.use(requestInterceptor, errorRequestInterceptor)
getAll.interceptors.response.use(responseInterceptor, errorResponseInterceptor)

export { wechatHttp, webHttp, getAll }
