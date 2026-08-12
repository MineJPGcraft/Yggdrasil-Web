import http from './http';
import type {CaptchaHeaders} from './types';

/**
 * 发送注册验证码（人机验证）
 * POST /email/code/register
 */
export const sendRegisterEmailCode = async (
    email: string,
    captchaHeaders?: CaptchaHeaders
): Promise<void> => {
    await http.post('/email/code/register', {email}, {headers: captchaHeaders});
};

/**
 * 发送登录验证码（人机验证）
 * POST /email/code/login
 */
export const sendLoginEmailCode = async (
    email: string,
    captchaHeaders?: CaptchaHeaders
): Promise<void> => {
    await http.post('/email/code/login', {email}, {headers: captchaHeaders});
};

/**
 * 发送修改密码验证码（Cookie 身份验证）
 * POST /email/code/change-password
 */
export const sendChangePasswordEmailCode = async (): Promise<void> => {
    await http.post('/email/code/change-password');
};

/**
 * 发送设置/更改邮箱验证码（Cookie 身份验证）
 * POST /email/code/set-email
 */
export const sendSetEmailCode = async (email: string): Promise<void> => {
    await http.post('/email/code/set-email', {email});
};
