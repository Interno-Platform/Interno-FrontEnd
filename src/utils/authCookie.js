import CryptoJS from "crypto-js";

const TOKEN_COOKIE_NAME = "ims_token";
const COOKIE_SECRET =
  import.meta.env.VITE_AUTH_COOKIE_SECRET || "interno-auth-cookie-secret";

const getCookieValue = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
};

const encryptToken = (token) =>
  CryptoJS.AES.encrypt(token, COOKIE_SECRET).toString();

const decryptToken = (encryptedToken) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, COOKIE_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch {
    return null;
  }
};

export const getAuthTokenCookie = () => {
  if (typeof document === "undefined") {
    return null;
  }

  const encryptedToken = getCookieValue(TOKEN_COOKIE_NAME);
  return encryptedToken ? decryptToken(encryptedToken) : null;
};

export const setAuthTokenCookie = (token) => {
  if (typeof document === "undefined") {
    return;
  }

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  const encryptedToken = encryptToken(token);
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(encryptedToken)}; Path=/; SameSite=Strict${secureFlag}`;
};

export const clearAuthTokenCookie = () => {
  if (typeof document === "undefined") {
    return;
  }

  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict${secureFlag}`;
};
