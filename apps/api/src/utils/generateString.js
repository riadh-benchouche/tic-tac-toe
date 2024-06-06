export default function (length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let str = "";
    for (let i = 0; i < length; i++) {
        str += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return str;
}