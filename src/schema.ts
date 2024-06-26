type ApiResponse = {
  status: 'success' | 'fail';
  data?: any;
  errors?: {
    code: number;
    message: string;
    // details?: {
    //   message: string;
    //   path: string;
    // }[];
    details?: Record<string, string>[];
  };
};

export type CurrentUser = { user: { userId: number; username: string } };

export default ApiResponse;
