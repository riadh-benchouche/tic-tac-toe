export default function (length) {
    const charset = "0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return code;
}