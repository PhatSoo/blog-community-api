export const ConvertSlug = (value: string): string => {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // thay khoảng trắng bằng '-'.
        .replace(/^-+|-+$/g, ''); // bỏ dấu gạch ngang ở đầu và cuối (nếu có).
};
