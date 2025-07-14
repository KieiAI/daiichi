/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserCreate } from '../models/UserCreate';
import type { UserInfo } from '../models/UserInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Get Current User Info
     * @returns UserInfo Successful Response
     * @throws ApiError
     */
    public static getCurrentUserInfoApiV1UserUserIdGet(): CancelablePromise<UserInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/user/{user_id}',
        });
    }
    /**
     * Create User
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createUserApiV1UserCreatePost(
        requestBody: UserCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/user/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
