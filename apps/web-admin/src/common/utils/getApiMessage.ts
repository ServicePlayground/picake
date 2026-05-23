const getApiMessage = {
  error(error: any) {
    return error.response?.data?.data?.message || error.response?.data?.message || error.message;
  },
  success(data: any) {
    return data.message;
  },
};

export default getApiMessage;
