export const convertSlug = (value: string): string => {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // thay khoảng trắng bằng '-'.
        .replace(/^-+|-+$/g, ''); // bỏ dấu gạch ngang ở đầu và cuối (nếu có).
};

export const removeSpace = (value: string): string => {
    return value.trim().replace(/\s+/g, ' ');
};
