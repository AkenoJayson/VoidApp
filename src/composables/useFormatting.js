export function useFormatting() {
    const formatPrice = (price) => {
        if (price === null || price === undefined) return 'R 0.00';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(price);
    };

    const isRecent = (dateStr) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= 60;
    };

    return { formatPrice, isRecent };
}
