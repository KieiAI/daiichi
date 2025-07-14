/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login
     * ログイン後、アクセストークンとリフレッシュトークンをCookieに設定
     * @param requestBody
     * @returns LoginResponse Successful Response
     * @throws ApiError
     */
    public static loginApiV1AuthLoginPost(
        requestBody: LoginRequest,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Refresh Tokens
     * Cookieからリフレッシュトークンを読み取り、検証後に新しいトークンをCookieに設定
     * @returns LoginResponse Successful Response
     * @throws ApiError
     */
    public static refreshTokensApiV1AuthRefreshPost(): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/refresh',
        });
    }
    /**
     * Logout
     * Cookieから認証トークンを削除
     * @returns LoginResponse Successful Response
     * @throws ApiError
     */
    public static logoutApiV1AuthLogoutPost(): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/logout',
        });
    }
}
