import { wechatHttp } from './axios'

const Api = {
    getRoadInfo: '/mobile/member/getRoadInfo.koala',
    getRouteDetail: '/mobile/member/getRoadState.koala',
    getBusLiveStatus: '/mobile/member/getBusStateByRoadid.koala'
}

export const searchRoute = (res = {}) => {
    const data = {
        companyNo: '171020091821002',
        scontent: res.scontent || '99999', // 如果未传入 scontent，则默认为 '99999'
    }
    return wechatHttp.post(
        Api.getRoadInfo,
        `params=${JSON.stringify(data)}`
    )
}
export const getRouteDetail = (res = {}) => {
    const data = {
        companyNo: '171020091821002',
        scontent: res.routeid, // 如果未传入 scontent，则默认为 '99999'
    }
    return wechatHttp.post(
        Api.getRouteDetail,
        `params=${JSON.stringify(data)}`
    )
}