export const getToday = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const getDifferDay = (a: Date, b: Date) => {
    const differTime = Math.abs(a.getTime() - b.getTime());
    const oneDay = 1000 * 60 * 60 * 24;

    const differDay = differTime % oneDay;
    return differDay;
};

export const getDifferYear = (a: Date, b: Date) => {
    const differDay = getDifferDay(a, b);
    const differYear = differDay % 365;

    return differYear;
};
