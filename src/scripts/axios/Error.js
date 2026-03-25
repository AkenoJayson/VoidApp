const handleAxiosError = (e, primeToast) => {
    const errorLifetimeMs = 6000;
    if (e.response?.data?.errors) {
        if (e.response.data?.errors) {
            for (const [key, value] of Object.entries(e?.response?.data?.errors)) {
                primeToast.add({ severity: 'error', detail: 'Error: ' + value, life: errorLifetimeMs });
            }
            return;
        }
    } else if (e.response?.data?.title) {
        primeToast.add({ severity: 'error', detail: 'Error: ' + e.response.data.title, life: errorLifetimeMs });
        return;
    }
    primeToast.add({ severity: 'error', detail: 'Error: ' + e.message, life: errorLifetimeMs });
};

export default handleAxiosError;
