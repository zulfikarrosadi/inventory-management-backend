type ApiResponse = {
  status: 'success';
  data: any;
} | {
  status: 'fail';
  errors: {
    code: number;
    message: string;
    details?: Record<string, string>[];
  };
}

export type CurrentUser = { user: { userId: number; username: string } };

export default ApiResponse;
