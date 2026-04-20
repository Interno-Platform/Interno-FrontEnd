import { api } from "./api";

const toTimestamp = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const normalizeContactMessagesResponse = (responseData) => {
  const payload = responseData?.data || responseData;
  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];
  const sortedList = [...list].sort(
    (a, b) =>
      toTimestamp(b?.created_at || b?.createdAt || b?.updated_at) -
      toTimestamp(a?.created_at || a?.createdAt || a?.updated_at),
  );

  return {
    ...payload,
    data: sortedList,
    count: payload?.count ?? sortedList.length,
    message: responseData?.message || payload?.message,
  };
};

// Submit Contact Us message - POST /api/website/contact-us
export const submitContactUsMessage = async (messageData) => {
  const response = await api.post("/api/website/contact-us", messageData);
  return response.data;
};

// Get Contact Us messages - GET /api/website/contact-us
export const getContactUsMessages = async () => {
  const response = await api.get("/api/website/contact-us");
  return normalizeContactMessagesResponse(response.data);
};
