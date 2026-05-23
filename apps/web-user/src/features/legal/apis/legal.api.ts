import axios from "axios";

export const legalApi = {
  getDocument: async (filename: string): Promise<string> => {
    const config = {
      timeout: 10000,
      headers: { Accept: "text/html, */*" },
      transformResponse: [(data: string) => data],
    };
    const response = await axios.get<string>(`/legal/${filename}`, config);
    return response.data;
  },
};
