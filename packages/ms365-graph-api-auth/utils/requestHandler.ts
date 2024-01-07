import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

type BaseRequest<U, T = AxiosRequestConfig> = (
  params?: T
) => Promise<AxiosResponse<U>>;

type BaseResponse<U, E = AxiosError> = Promise<
  SuccessResponse<U> | ErrorResponse<E>
>;

type SuccessResponse<U> = {
  success: true;
  data: U;
};

type ErrorResponse<E> = {
  success: false;
  error: E;
};

type RequestHandler = <U, T = AxiosRequestConfig, E = AxiosError>(
  request: BaseRequest<U, T>
) => (params?: T) => BaseResponse<U, E>;

export const getRequestHandler: RequestHandler =
  <U, T = AxiosRequestConfig, E = AxiosRequestConfig>(
    request: BaseRequest<U, T>
  ) =>
  async (params?: T): BaseResponse<U, E> => {
    try {
      const response = await request(params);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as E,
      };
    }
  };
