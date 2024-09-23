import axios from "axios";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const headers = {
  'Content-Type': 'application/json'
};

/**
 * Search papers based on the query.
 * @param query The query string to search for.
 * @returns The response from the API.
 */
export const searchPapers = async (query: string): Promise<any> => {
  const apiUrl = `${baseApiUrl}/papers/search?${query}`;
  const response = await axios.get(apiUrl);
  if (!sessionStorage.getItem('query'))
    sessionStorage.setItem('query', query);
  return response;
};

/**
 * Export the papers data.
 * @returns The response from the API.
 */
export const exportPapers = async (): Promise<any> => {
  const apiUrl = `${baseApiUrl}/papers/export`;
  const response = await axios.post(apiUrl, { headers });
  return response;
}

/**
 * Get the total count of papers.
 * @returns The response from the API.
 */
export const getTotalCount = async (query: String): Promise<any> => {
  const apiUrl = `${baseApiUrl}/papers/getTotalCount?${query}`;
  const response = await axios.get(apiUrl, { headers });
  return response;
}

/**
 * Get the total count of papers.
 * @returns The response from the API.
 */
export const giveInstruction = async (instruction: String, model: String): Promise<any> => {
  const apiUrl = `${baseApiUrl}/papers/mutate_from_chat`;
  const chatId = sessionStorage.getItem('chatId');
  const data = chatId ? { 'query': instruction, 'chat_id': chatId, 'model': model } : { 'query': instruction, 'model': model };
  const response = await axios.post(apiUrl, data, { headers });
  if (!chatId) {
    sessionStorage.setItem('chatId', response.data['chat']);
  }
  return response;
}

export const getChatHistory = async (): Promise<any> => {
  const apiUrl = `${baseApiUrl}/papers/chat_history`;
  const chatId = sessionStorage.getItem('chatId') || '';
  const response = await axios.get(`${apiUrl}?chat_id=${chatId}`);
  return response;
}