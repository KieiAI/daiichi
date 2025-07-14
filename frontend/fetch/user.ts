import type { UserCreate, UserInfo } from "@/api-client";
import { UserService } from "@/api-client/services/UserService";

export async function createUser(user: UserCreate): Promise<UserInfo> {
  try {
    const response = await UserService.createUserApiV1UserCreatePost(user);
    return response;
  } catch (error) {
    throw error;
  }
}
