import crypto from 'crypto';

export default function generateRandomPassword(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from(crypto.randomBytes(length))
        .map(byte => characters[byte % characters.length])
        .join('');
}
