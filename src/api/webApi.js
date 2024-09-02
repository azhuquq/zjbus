import { webHttp } from './axios'

const Api = {
    noticeIndex: '/index/web.content/getindex',
    noticeList: '/index/web.content/getContentByPage',
    noticeDetail: '/index/web.details/getindex'
}


export const getNoticeIndex = (res = {}) => {
    res.type = '4';
    return webHttp.get(Api.noticeIndex, {
        params: res,
    })
}

export const getNoticeList = (res = {}) => {
    const data = {
        type: '4',
        page: res.page
    }
    console.log("🚩 ~ getNoticeList ~ res 👇\n", res)
    return webHttp.get(Api.noticeList, {
        params: data,
    })
}

export const getNoticeDetail = (res = {}) => {
    return webHttp.get(Api.noticeDetail, res)
}
