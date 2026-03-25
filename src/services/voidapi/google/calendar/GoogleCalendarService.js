import axiosN from '@/services/axios/axiosVoidApiInstance';

const GoogleCalendarService = {
    async GetUpcomingEvents(params) {
        return await axiosN.get('api/GoogleCalendar/GetUpcomingEvents', { params });
    },
    async GetGoogleCalendarStatusDropdown() {
        return await axiosN.get('api/GoogleCalendar/GetGoogleCalendarStatusDropdown');
    },
    async UpdateEvent(model) {
        return await axiosN.post('api/GoogleCalendar/UpdateEvent', model);
    }
};

export default GoogleCalendarService;
