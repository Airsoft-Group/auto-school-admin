import Cookies from "js-cookie";

const languageKey = "language";
export const getLanguage = () => Cookies.get(languageKey);
export const setLanguage = (language: string) =>
  Cookies.set(languageKey, language);

// User
const accessTokenKey = "edu_access_token";

export const getAccessToken = () => Cookies.get(accessTokenKey);
export const setAccessToken = (token: string) =>
  Cookies.set(accessTokenKey, token);
export const removeAccessToken = () => Cookies.remove(accessTokenKey);

// User info

const user_info = "edu_user_info";

export const getUserInfo = () => Cookies.get(user_info) ? JSON.parse(Cookies.get(user_info) as string) : null;
export const setUserInfo = (data: any) =>
  Cookies.set(user_info, JSON.stringify(data));
export const removeUserInfo = () => Cookies.remove(user_info);

// User
const refreshTokenKey = "edu_refresh_token";
export const getRefreshToken = () => Cookies.get(refreshTokenKey);
export const setRefreshToken = (token: string) =>
  Cookies.set(refreshTokenKey, token);
export const removeRefreshToken = () => Cookies.remove(refreshTokenKey);
