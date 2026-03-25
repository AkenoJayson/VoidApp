import axios from '@/services/axios/axiosVoidApiInstance';

const CentrifugoService = {
    async getToken() {
        return await axios.get('api/Centrifugo/GetCentrifugoToken');
    }
};

export default CentrifugoService;
