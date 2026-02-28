// utils/truncate.js
export const truncateWords = (text, maxWords = 7) => {
    if (!text) return "Không có mô tả";

    const words = text.trim().split(/\s+/); // Tách theo khoảng trắng
    if (words.length <= maxWords) return text;

    return words.slice(0, maxWords).join(" ") + "...";
};