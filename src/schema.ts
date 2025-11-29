type ApiResponse<T> =
  | {
    status: "success";
    data: Record<string, T>;
  }
  | {
    status: "fail";
    errors: {
      code: number;
      message: string;
      details?: Record<string, unknown>;
    };
  };

export type CurrentUser = { user: { userId: number; username: string } };

export default ApiResponse;
