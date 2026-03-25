import axiosN from '@/services/axios/axiosVoidApiInstance';

const WebAppsService = {
    async Save(model) {
        return await axiosN.post('api/homeserver/save', model);
    },
    async StatusPing() {
        return await axiosN.post('api/homeserver/statusping');
    },
    async GetWebApps(params) {
        return await axiosN.get('api/homeserver/GetWebApps', params);
    },
    async GetQuickLinks() {
        return await axiosN.get('api/homeserver/GetQuickLinks');
    },
    async GetWebAppTypeCategory() {
        return await axiosN.get('api/homeserver/GetWebAppTypeCategory');
    },
    async GetWebAppGroups(params) {
        return await axiosN.get('api/homeserver/GetWebAppGroups', params);
    },
    async AssignAppToGroup(model) {
        return await axiosN.post('api/homeserver/AssignAppToGroup', model);
    },
    async SaveWebAppGroup(model) {
        return await axiosN.post('api/homeserver/SaveWebAppGroup', model);
    }
};

export default WebAppsService;
