import jwt from "jsonwebtoken";

export const generateTokensAndSetCookies = (res, userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30d",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "365d",
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // Expires in 30 days (milliseconds)
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        path: '/api/auth/refresh-token',
    });

    return refreshToken;
};
