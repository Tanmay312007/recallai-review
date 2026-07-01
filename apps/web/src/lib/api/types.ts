import type { ApiResponse, ApiErrorResponse, UserDto } from '@recallai/shared';
export { ErrorCode } from '@recallai/shared';
export type { ApiResponse, ApiErrorResponse, UserDto };

export interface AuthSessionResponse {
  user: UserDto;
  accessToken: string;
}
