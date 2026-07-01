import type { ApiResponse, ApiErrorResponse, UserDto } from '@lumora/shared';
export { ErrorCode } from '@lumora/shared';
export type { ApiResponse, ApiErrorResponse, UserDto };

export interface AuthSessionResponse {
  user: UserDto;
  accessToken: string;
}
