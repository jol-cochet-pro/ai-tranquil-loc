export class AuthResponseDto {
  accessToken: string;
  account: {
    id: string;
    email: string;
  };
}
