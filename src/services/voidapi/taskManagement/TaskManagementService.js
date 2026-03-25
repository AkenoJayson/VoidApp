import axiosN from '@/services/axios/axiosVoidApiInstance';

const TaskManagementService = {
    async GetTasks() {
        return await axiosN.get('/api/Tasks/GetTasks');
    },
    async SaveVoidTask(model) {
        return await axiosN.post('/api/Tasks/SaveVoidTask', model);
    },
    async GetTaskSummary() {
        return await axiosN.get('/api/Tasks/GetTaskSummary');
    },
    async GetStatusDropdown() {
        return await axiosN.get('/api/Tasks/GetStatusDropdown');
    }
};

export default TaskManagementService;
