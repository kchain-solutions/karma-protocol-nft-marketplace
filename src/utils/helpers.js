export function cutStringAfterWords(str, wordLimit) {
    const words = str.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    } else {
        return str;
    }
}

export function cutStringAfterChars(str, charLimit) {
    if (str.length > charLimit) {
        return str.substring(0, charLimit) + '...';
    } else {
        return str;
    }
}    