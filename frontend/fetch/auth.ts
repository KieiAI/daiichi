import { LoginRequest, LoginResponse } from "@/api-client";
import { AuthService } from "@/api-client/services/AuthService";

export async function login(
  name: string,
  password: string
): Promise<LoginResponse> {
  const requestBody: LoginRequest = { name, password };
  try {
    const response = await AuthService.loginApiV1AuthLoginPost(requestBody);
    return response;
  } catch (error) {
    throw error;
  }
}
