import { Router, Request, Response, NextFunction } from "express";

import { ProviderConfig } from "wasp/auth/providers/types";
import type { EmailFromField } from "wasp/server/email/core/types";

import { getLoginRoute } from "../email/login.js";
import { getSignupRoute } from "../email/signup.js";
import { getRequestPasswordResetRoute } from "../email/requestPasswordReset.js";
import { resetPassword } from "../email/resetPassword.js";
import { verifyEmail } from "../email/verifyEmail.js";
import { GetVerificationEmailContentFn, GetPasswordResetEmailContentFn } from "wasp/server/auth/email";
import { handleRejection } from "wasp/server/utils";
import { env } from "wasp/server";

import { userSignupFields } from '../../../../../../../src/server/auth/userSignupFields.ts'
const _waspUserSignupFields = userSignupFields

import { getPasswordResetEmailContent } from '../../../../../../../src/server/auth/emailContent.ts'
const _waspGetPasswordResetEmailContent: GetPasswordResetEmailContentFn = getPasswordResetEmailContent;

const _waspGetVerificationEmailContent: GetVerificationEmailContentFn = ({ verificationLink }) => ({
    subject: 'Verify your email',
    text: `Click the link below to verify your email: ${verificationLink}`,
    html: `
        <p>Click the link below to verify your email</p>
        <a href="${verificationLink}">Verify email</a>
    `,
});

const fromField: EmailFromField = {
    name: 'Thesis Grey',
    email: 'noreply@thesis-grey.app',
};

const config: ProviderConfig = {
    id: "email",
    displayName: "Email and password",
    createRouter() {
        const router = Router();

        const loginRoute = handleRejection(getLoginRoute());
        router.post('/login', loginRoute);

        const signupRoute = handleRejection(getSignupRoute({
            userSignupFields: _waspUserSignupFields,
            fromField,
            clientRoute: '/email-verification',
            getVerificationEmailContent: _waspGetVerificationEmailContent,
            isEmailAutoVerified: env.SKIP_EMAIL_VERIFICATION_IN_DEV,
        }));
        router.post('/signup', signupRoute);
        
        const requestPasswordResetRoute = handleRejection(getRequestPasswordResetRoute({
            fromField,
            clientRoute: '/password-reset',
            getPasswordResetEmailContent: _waspGetPasswordResetEmailContent,
        }));
        router.post('/request-password-reset', requestPasswordResetRoute);

        router.post('/reset-password', handleRejection(resetPassword));
        router.post('/verify-email', handleRejection(verifyEmail));

        return router;
    },
}

export default config;
