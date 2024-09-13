import { getAll } from './axios'
import { wechatHttp } from './axios'
const Api = {
    getRouteDetail: '/mobile/member/getRoadState.koala',
}
export const getAllRoute = (res = {}) => {
    const data = {
        companyNo: '171020091821002',
        scontent: '99999',
    }
    return wechatHttp.post(
        Api.getRouteDetail,
        `params=${JSON.stringify(data)}`
    )
}
