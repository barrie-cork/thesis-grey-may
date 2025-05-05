import http from 'http';
import express, { Router } from 'express';
import * as z from 'zod';
import Prisma, { Prisma as Prisma$1 } from '@prisma/client';
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { verify, hash } from '@node-rs/argon2';
import { deserialize, serialize } from 'superjson';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { webcrypto } from 'node:crypto';

const redColor = "\x1B[31m";
function ensureEnvSchema(data, schema) {
  try {
    return schema.parse(data);
  } catch (e) {
    if (e instanceof z.ZodError) {
      const errorOutput = ["", "\u2550\u2550 Env vars validation failed \u2550\u2550", ""];
      for (const error of e.errors) {
        errorOutput.push(` - ${error.message}`);
      }
      errorOutput.push("");
      errorOutput.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
      console.error(redColor, errorOutput.join("\n"));
      throw new Error("Error parsing environment variables");
    } else {
      throw e;
    }
  }
}

const userServerEnvSchema = z.object({});
const waspServerCommonSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string({
    required_error: "DATABASE_URL is required"
  }),
  PG_BOSS_NEW_OPTIONS: z.string().optional(),
  SKIP_EMAIL_VERIFICATION_IN_DEV: z.enum(["true", "false"], {
    message: 'SKIP_EMAIL_VERIFICATION_IN_DEV must be either "true" or "false"'
  }).transform((value) => value === "true").default("false")
});
const serverUrlSchema = z.string({
  required_error: "WASP_SERVER_URL is required"
}).url({
  message: "WASP_SERVER_URL must be a valid URL"
});
const clientUrlSchema = z.string({
  required_error: "WASP_WEB_CLIENT_URL is required"
}).url({
  message: "WASP_WEB_CLIENT_URL must be a valid URL"
});
const jwtTokenSchema = z.string({
  required_error: "JWT_SECRET is required"
});
const serverDevSchema = z.object({
  NODE_ENV: z.literal("development"),
  WASP_SERVER_URL: serverUrlSchema.default("http://localhost:3001"),
  WASP_WEB_CLIENT_URL: clientUrlSchema.default("http://localhost:3000/"),
  JWT_SECRET: jwtTokenSchema.default("DEVJWTSECRET")
});
const serverProdSchema = z.object({
  NODE_ENV: z.literal("production"),
  WASP_SERVER_URL: serverUrlSchema,
  WASP_WEB_CLIENT_URL: clientUrlSchema,
  JWT_SECRET: jwtTokenSchema
});
const serverCommonSchema = userServerEnvSchema.merge(waspServerCommonSchema);
const serverEnvSchema = z.discriminatedUnion("NODE_ENV", [
  serverDevSchema.merge(serverCommonSchema),
  serverProdSchema.merge(serverCommonSchema)
]);
const env = ensureEnvSchema(Object.assign({ NODE_ENV: serverDevSchema.shape.NODE_ENV.value }, process.env), serverEnvSchema);

function stripTrailingSlash(url) {
  return url === null || url === void 0 ? void 0 : url.replace(/\/$/, "");
}

const frontendUrl = stripTrailingSlash(env.WASP_WEB_CLIENT_URL);
stripTrailingSlash(env.WASP_SERVER_URL);
const allowedCORSOriginsPerEnv = {
  development: "*",
  production: [frontendUrl]
};
const allowedCORSOrigins = allowedCORSOriginsPerEnv[env.NODE_ENV];
const config$1 = {
  allowedCORSOrigins,
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  auth: {
    jwtSecret: env.JWT_SECRET
  }
};

function createDbClient() {
  return new Prisma.PrismaClient();
}
const dbClient = createDbClient();

class HttpError extends Error {
  constructor(statusCode, message, data, options) {
    super(message, options);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
    this.name = this.constructor.name;
    if (!(Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600)) {
      throw new Error("statusCode has to be integer in range [400, 600).");
    }
    this.statusCode = statusCode;
    if (data) {
      this.data = data;
    }
  }
}

const handleRejection = (middleware) => async (req, res, next) => {
  try {
    await middleware(req, res, next);
  } catch (error) {
    next(error);
  }
};

const prismaAdapter = new PrismaAdapter(dbClient.session, dbClient.auth);
const auth$1 = new Lucia(prismaAdapter, {
  // Since we are not using cookies, we don't need to set any cookie options.
  // But in the future, if we decide to use cookies, we can set them here.
  // sessionCookie: {
  //   name: "session",
  //   expires: true,
  //   attributes: {
  //     secure: !config.isDevelopment,
  //     sameSite: "lax",
  //   },
  // },
  getUserAttributes({ userId }) {
    return {
      userId
    };
  }
});

const hashingOptions = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
  version: 1
};
async function hashPassword(password) {
  return hash(normalizePassword(password), hashingOptions);
}
async function verifyPassword(hashedPassword, password) {
  const validPassword = await verify(hashedPassword, normalizePassword(password), hashingOptions);
  if (!validPassword) {
    throw new Error("Invalid password");
  }
}
function normalizePassword(password) {
  return password.normalize("NFKC");
}

const PASSWORD_FIELD = "password";
const USERNAME_FIELD = "username";
function ensureValidUsername(args) {
  validate(args, [
    { validates: USERNAME_FIELD, message: "username must be present", validator: (username) => !!username }
  ]);
}
function ensurePasswordIsPresent(args) {
  validate(args, [
    { validates: PASSWORD_FIELD, message: "password must be present", validator: (password) => !!password }
  ]);
}
function ensureValidPassword(args) {
  validate(args, [
    { validates: PASSWORD_FIELD, message: "password must be at least 8 characters", validator: (password) => isMinLength(password, 8) },
    { validates: PASSWORD_FIELD, message: "password must contain a number", validator: (password) => containsNumber(password) }
  ]);
}
function throwValidationError(message) {
  throw new HttpError(422, "Validation failed", { message });
}
function validate(args, validators) {
  for (const { validates, message, validator } of validators) {
    if (!validator(args[validates])) {
      throwValidationError(message);
    }
  }
}
function isMinLength(input, minLength) {
  if (typeof input !== "string") {
    return false;
  }
  return input.length >= minLength;
}
function containsNumber(input) {
  if (typeof input !== "string") {
    return false;
  }
  return /\d/.test(input);
}

var __rest$1 = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
({
  entities: {
    User: dbClient.user
  }
});
function createProviderId(providerName, providerUserId) {
  return {
    providerName,
    providerUserId: providerUserId.toLowerCase()
  };
}
async function findAuthIdentity(providerId) {
  return dbClient.authIdentity.findUnique({
    where: {
      providerName_providerUserId: providerId
    }
  });
}
async function findAuthWithUserBy(where) {
  const result = await dbClient.auth.findFirst({ where, include: { user: true } });
  if (result === null) {
    return null;
  }
  if (result.user === null) {
    return null;
  }
  return Object.assign(Object.assign({}, result), { user: result.user });
}
async function createUser(providerId, serializedProviderData, userFields) {
  return dbClient.user.create({
    data: Object.assign(Object.assign({}, userFields !== null && userFields !== void 0 ? userFields : {}), { auth: {
      create: {
        identities: {
          create: {
            providerName: providerId.providerName,
            providerUserId: providerId.providerUserId,
            providerData: serializedProviderData
          }
        }
      }
    } }),
    // We need to include the Auth entity here because we need `authId`
    // to be able to create a session.
    include: {
      auth: true
    }
  });
}
function rethrowPossibleAuthError(e) {
  if (e instanceof Prisma$1.PrismaClientKnownRequestError && e.code === "P2002") {
    throw new HttpError(422, "Save failed", {
      message: `user with the same identity already exists`
    });
  }
  if (e instanceof Prisma$1.PrismaClientValidationError) {
    console.error(e);
    throw new HttpError(422, "Save failed", {
      message: "there was a database error"
    });
  }
  if (e instanceof Prisma$1.PrismaClientKnownRequestError && e.code === "P2021") {
    console.error(e);
    console.info("\u{1F41D} This error can happen if you did't run the database migrations.");
    throw new HttpError(500, "Save failed", {
      message: `there was a database error`
    });
  }
  if (e instanceof Prisma$1.PrismaClientKnownRequestError && e.code === "P2003") {
    console.error(e);
    console.info(`\u{1F41D} This error can happen if you have some relation on your User entity
   but you didn't specify the "onDelete" behaviour to either "Cascade" or "SetNull".
   Read more at: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions`);
    throw new HttpError(500, "Save failed", {
      message: `there was a database error`
    });
  }
  throw e;
}
async function validateAndGetUserFields(data, userSignupFields) {
  const { password: _password } = data, sanitizedData = __rest$1(data, ["password"]);
  const result = {};
  if (!userSignupFields) {
    return result;
  }
  for (const [field, getFieldValue] of Object.entries(userSignupFields)) {
    try {
      const value = await getFieldValue(sanitizedData);
      result[field] = value;
    } catch (e) {
      throwValidationError(e.message);
    }
  }
  return result;
}
function getProviderData(providerData) {
  return sanitizeProviderData(getProviderDataWithPassword(providerData));
}
function getProviderDataWithPassword(providerData) {
  return JSON.parse(providerData);
}
function sanitizeProviderData(providerData) {
  if (providerDataHasPasswordField(providerData)) {
    const { hashedPassword } = providerData, rest = __rest$1(providerData, ["hashedPassword"]);
    return rest;
  } else {
    return providerData;
  }
}
async function sanitizeAndSerializeProviderData(providerData) {
  return serializeProviderData(await ensurePasswordIsHashed(providerData));
}
function serializeProviderData(providerData) {
  return JSON.stringify(providerData);
}
async function ensurePasswordIsHashed(providerData) {
  const data = Object.assign({}, providerData);
  if (providerDataHasPasswordField(data)) {
    data.hashedPassword = await hashPassword(data.hashedPassword);
  }
  return data;
}
function providerDataHasPasswordField(providerData) {
  return "hashedPassword" in providerData;
}
function createInvalidCredentialsError(message) {
  return new HttpError(401, "Invalid credentials", { message });
}

var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
function createAuthUserData(user) {
  const { auth } = user, rest = __rest(user, ["auth"]);
  if (!auth) {
    throw new Error(`\u{1F41D} Error: trying to create a user without auth data.
This should never happen, but it did which means there is a bug in the code.`);
  }
  const identities = {
    username: getProviderInfo(auth, "username")
  };
  return Object.assign(Object.assign({}, rest), { identities });
}
function getProviderInfo(auth, providerName) {
  const identity = getIdentity(auth, providerName);
  if (!identity) {
    return null;
  }
  return Object.assign(Object.assign({}, getProviderData(identity.providerData)), { id: identity.providerUserId });
}
function getIdentity(auth, providerName) {
  var _a;
  return (_a = auth.identities.find((i) => i.providerName === providerName)) !== null && _a !== void 0 ? _a : null;
}

async function createSession(authId) {
  return auth$1.createSession(authId, {});
}
async function getSessionAndUserFromBearerToken(req) {
  const authorizationHeader = req.headers["authorization"];
  if (typeof authorizationHeader !== "string") {
    return null;
  }
  const sessionId = auth$1.readBearerToken(authorizationHeader);
  if (!sessionId) {
    return null;
  }
  return getSessionAndUserFromSessionId(sessionId);
}
async function getSessionAndUserFromSessionId(sessionId) {
  const { session, user: authEntity } = await auth$1.validateSession(sessionId);
  if (!session || !authEntity) {
    return null;
  }
  return {
    session,
    user: await getAuthUserData(authEntity.userId)
  };
}
async function getAuthUserData(userId) {
  const user = await dbClient.user.findUnique({
    where: { id: userId },
    include: {
      auth: {
        include: {
          identities: true
        }
      }
    }
  });
  if (!user) {
    throw createInvalidCredentialsError();
  }
  return createAuthUserData(user);
}
function invalidateSession(sessionId) {
  return auth$1.invalidateSession(sessionId);
}

const auth = handleRejection(async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.sessionId = null;
    req.user = null;
    return next();
  }
  const sessionAndUser = await getSessionAndUserFromBearerToken(req);
  if (sessionAndUser === null) {
    throw createInvalidCredentialsError();
  }
  req.sessionId = sessionAndUser.session.id;
  req.user = sessionAndUser.user;
  next();
});

function isNotNull(value) {
  return value !== null;
}

function makeAuthUserIfPossible(user) {
  return user ? makeAuthUser(user) : null;
}
function makeAuthUser(data) {
  return Object.assign(Object.assign({}, data), { getFirstProviderUserId: () => {
    const identities = Object.values(data.identities).filter(isNotNull);
    return identities.length > 0 ? identities[0].id : null;
  } });
}

function createOperation(handlerFn) {
  return handleRejection(async (req, res) => {
    const args = req.body && deserialize(req.body) || {};
    const context = {
      user: makeAuthUserIfPossible(req.user)
    };
    const result = await handlerFn(args, context);
    const serializedResult = serialize(result);
    res.json(serializedResult);
  });
}
function createQuery(handlerFn) {
  return createOperation(handlerFn);
}
function createAction(handlerFn) {
  return createOperation(handlerFn);
}

const ROLES = {
  ADMIN: "Admin",
  LEAD_REVIEWER: "Lead Reviewer",
  RESEARCHER: "Researcher"
};
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.LEAD_REVIEWER, ROLES.RESEARCHER],
  [ROLES.LEAD_REVIEWER]: [ROLES.RESEARCHER],
  [ROLES.RESEARCHER]: []
};
const hasRole = (user, role) => {
  if (!user) return false;
  if (user.role === role) return true;
  return ROLE_HIERARCHY[user.role]?.includes(role) || false;
};
const hasAnyRole = (user, roles) => {
  if (!user || !roles.length) return false;
  return roles.some((role) => hasRole(user, role));
};
const requireAnyRole = (user, roles, message = `One of these roles required: ${roles.join(", ")}`) => {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }
  if (!hasAnyRole(user, roles)) {
    throw new HttpError(403, message);
  }
};

const executeSearchQuery$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  requireAnyRole(context.user, ["Lead Reviewer", "Admin"], "Only Lead Reviewers and Admins can execute searches");
  const { queryId, maxResults = 100 } = args;
  if (!queryId) {
    throw new HttpError(400, "Query ID is required");
  }
  try {
    const query = await context.entities.SearchQuery.findUnique({
      where: { id: queryId },
      include: { searchSession: true }
    });
    if (!query) {
      throw new HttpError(404, "Query not found");
    }
    if (query.searchSession.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this query");
    }
    const execution = await context.entities.SearchExecution.create({
      data: {
        queryId: query.id,
        sessionId: query.searchSession.id,
        status: "running",
        startTime: /* @__PURE__ */ new Date()
      }
    });
    await executeSearch(context.entities, execution.id, query, maxResults);
    return {
      executionId: execution.id,
      queryId: query.id,
      status: "running",
      startTime: execution.startTime
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error executing query:", error);
    throw new HttpError(500, "An error occurred while executing the search query");
  }
};
async function executeSearch(entities, executionId, query, maxResults) {
  try {
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error("SERPER_API_KEY is not defined");
    }
    const response = await axios.post("https://google.serper.dev/search", {
      q: query.query,
      num: maxResults
    }, {
      headers: {
        "X-API-KEY": serperApiKey,
        "Content-Type": "application/json"
      }
    });
    const results = response.data.organic || [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      await entities.RawSearchResult.create({
        data: {
          queryId: query.id,
          title: result.title || "Untitled",
          url: result.link || "",
          snippet: result.snippet || "",
          rank: i + 1,
          searchEngine: "google",
          rawResponse: result
        }
      });
    }
    await entities.SearchExecution.update({
      where: { id: executionId },
      data: {
        status: "completed",
        endTime: /* @__PURE__ */ new Date(),
        resultCount: results.length
      }
    });
  } catch (error) {
    console.error("Error in search execution:", error);
    await entities.SearchExecution.update({
      where: { id: executionId },
      data: {
        status: "failed",
        endTime: /* @__PURE__ */ new Date(),
        error: error.message || "Unknown error occurred"
      }
    });
  }
}

async function executeSearchQuery$1(args, context) {
  return executeSearchQuery$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchQuery: dbClient.searchQuery,
      SearchSession: dbClient.searchSession,
      SearchExecution: dbClient.searchExecution,
      RawSearchResult: dbClient.rawSearchResult
    }
  });
}

var executeSearchQuery = createAction(executeSearchQuery$1);

const processSessionResults$2 = async ({ sessionId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    const rawResults = await context.entities.RawSearchResult.findMany({
      where: {
        searchQuery: { sessionId },
        processedResult: null
      }
    });
    if (rawResults.length === 0) {
      return { processed: 0, message: "No new results to process" };
    }
    const processedResults = [];
    const duplicateRelationships = [];
    for (const rawResult of rawResults) {
      const processedResult = await createProcessedResult(
        context,
        rawResult,
        sessionId
      );
      processedResults.push(processedResult);
      await findDuplicates(
        context,
        processedResult,
        duplicateRelationships
      );
    }
    return {
      processed: processedResults.length,
      duplicatesFound: duplicateRelationships.length,
      message: `Processed ${processedResults.length} results with ${duplicateRelationships.length} potential duplicates identified`
    };
  } catch (error) {
    console.error("Error processing session results:", error);
    throw new HttpError(500, "Failed to process session results");
  }
};
async function createProcessedResult(context, rawResult, sessionId) {
  const metadata = {
    domain: extractDomain(rawResult.url),
    fileType: extractFileType(rawResult.url),
    source: rawResult.searchEngine,
    rawRank: rawResult.rank,
    processedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return await context.entities.ProcessedResult.create({
    data: {
      rawResultId: rawResult.id,
      sessionId,
      title: rawResult.title,
      url: normalizeUrl(rawResult.url),
      snippet: rawResult.snippet,
      metadata
    }
  });
}
async function findDuplicates(context, newResult, duplicateRelationships) {
  const normalizedUrl = normalizeUrl(newResult.url);
  const potentialDuplicates = await context.entities.ProcessedResult.findMany({
    where: {
      url: normalizedUrl,
      id: { not: newResult.id }
    }
  });
  for (const duplicate of potentialDuplicates) {
    const relationship = await context.entities.DuplicateRelationship.create({
      data: {
        primaryResultId: duplicate.id < newResult.id ? duplicate.id : newResult.id,
        duplicateResultId: duplicate.id < newResult.id ? newResult.id : duplicate.id,
        similarityScore: 1,
        // Full match based on URL
        duplicateType: "url_match"
      }
    });
    duplicateRelationships.push(relationship);
  }
  return duplicateRelationships;
}
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (error) {
    return "";
  }
}
function extractFileType(url) {
  try {
    const path = new URL(url).pathname;
    const extension = path.split(".").pop().toLowerCase();
    const documentTypes = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];
    if (documentTypes.includes(extension)) {
      return extension;
    }
    return "html";
  } catch (error) {
    return "unknown";
  }
}
function normalizeUrl(url) {
  try {
    let normalized = url.trim().toLowerCase();
    normalized = normalized.replace(/^https?:\/\//, "");
    normalized = normalized.replace(/^www\./, "");
    normalized = normalized.replace(/\/$/, "");
    return normalized;
  } catch (error) {
    return url;
  }
}

async function processSessionResults$1(args, context) {
  return processSessionResults$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      RawSearchResult: dbClient.rawSearchResult,
      ProcessedResult: dbClient.processedResult,
      DuplicateRelationship: dbClient.duplicateRelationship
    }
  });
}

var processSessionResults = createAction(processSessionResults$1);

const createReviewTag$2 = async ({ sessionId, name, color }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  requireAnyRole(context.user, ["Lead Reviewer", "Admin"], "Only Lead Reviewers and Admins can create review tags");
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    if (!name || !name.trim()) {
      throw new HttpError(400, "Tag name is required");
    }
    if (!color || !color.trim()) {
      throw new HttpError(400, "Tag color is required");
    }
    const existingTag = await context.entities.ReviewTag.findFirst({
      where: {
        sessionId,
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    });
    if (existingTag) {
      throw new HttpError(400, `A tag with the name "${name}" already exists`);
    }
    return await context.entities.ReviewTag.create({
      data: {
        sessionId,
        name,
        color
      }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error creating review tag:", error);
    throw new HttpError(500, "Failed to create review tag");
  }
};
const assignTag$2 = async ({ resultId, tagId, remove = false }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const result = await context.entities.ProcessedResult.findUnique({
      where: { id: resultId },
      include: {
        searchSession: true,
        reviewTags: true
      }
    });
    if (!result) {
      throw new HttpError(404, "Result not found");
    }
    if (result.searchSession.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this result");
    }
    if (remove) {
      const tagAssignment = await context.entities.ReviewTagAssignment.findFirst({
        where: {
          resultId,
          tagId
        }
      });
      if (!tagAssignment) {
        throw new HttpError(404, "Tag not assigned to this result");
      }
      await context.entities.ReviewTagAssignment.delete({
        where: { id: tagAssignment.id }
      });
      return { success: true, message: "Tag removed" };
    }
    const tag = await context.entities.ReviewTag.findUnique({
      where: { id: tagId }
    });
    if (!tag) {
      throw new HttpError(404, "Tag not found");
    }
    if (tag.sessionId !== result.searchSession.id) {
      throw new HttpError(400, "Tag does not belong to the same session as the result");
    }
    const existingAssignment = result.reviewTags.find((t) => t.tagId === tagId);
    if (existingAssignment) {
      return { success: true, message: "Tag already assigned" };
    }
    await context.entities.ReviewTagAssignment.create({
      data: {
        resultId,
        tagId
      }
    });
    return { success: true, message: "Tag assigned successfully" };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error assigning tag:", error);
    throw new HttpError(500, "Failed to assign tag");
  }
};
const createNote$2 = async ({ resultId, content }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    if (!content || !content.trim()) {
      throw new HttpError(400, "Note content is required");
    }
    const result = await context.entities.ProcessedResult.findUnique({
      where: { id: resultId },
      include: {
        searchSession: true
      }
    });
    if (!result) {
      throw new HttpError(404, "Result not found");
    }
    if (result.searchSession.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this result");
    }
    return await context.entities.Note.create({
      data: {
        resultId,
        content
      }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error creating note:", error);
    throw new HttpError(500, "Failed to create note");
  }
};

async function createReviewTag$1(args, context) {
  return createReviewTag$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      ReviewTag: dbClient.reviewTag
    }
  });
}

var createReviewTag = createAction(createReviewTag$1);

async function assignTag$1(args, context) {
  return assignTag$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      ProcessedResult: dbClient.processedResult,
      SearchSession: dbClient.searchSession,
      ReviewTagAssignment: dbClient.reviewTagAssignment,
      ReviewTag: dbClient.reviewTag
    }
  });
}

var assignTag = createAction(assignTag$1);

async function createNote$1(args, context) {
  return createNote$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      ProcessedResult: dbClient.processedResult,
      SearchSession: dbClient.searchSession,
      Note: dbClient.note
    }
  });
}

var createNote = createAction(createNote$1);

const exportResults$2 = async ({ sessionId, format = "csv", tagId = null }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    const where = { sessionId };
    if (tagId) {
      where.reviewTags = {
        some: {
          tagId
        }
      };
    }
    const results = await context.entities.ProcessedResult.findMany({
      where,
      include: {
        rawSearchResult: {
          select: {
            searchQuery: {
              select: {
                query: true
              }
            },
            rank: true,
            searchEngine: true
          }
        },
        reviewTags: {
          include: {
            tag: true
          }
        },
        notes: true
      }
    });
    const formattedResults = results.map((result) => {
      const tags = result.reviewTags.map((rt) => rt.tag.name).join(", ");
      const latestNote = result.notes.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]?.content || "";
      return {
        title: result.title,
        url: result.url,
        snippet: result.snippet || "",
        query: result.rawSearchResult.searchQuery.query,
        tags,
        notes: latestNote,
        domain: result.metadata.domain || "",
        fileType: result.metadata.fileType || "",
        source: result.rawSearchResult.searchEngine || "",
        rank: result.rawSearchResult.rank
      };
    });
    switch (format.toLowerCase()) {
      case "csv":
        return {
          format: "csv",
          filename: `thesis-grey-export-${session.name}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`,
          content: generateCSV(formattedResults)
        };
      case "json":
        return {
          format: "json",
          filename: `thesis-grey-export-${session.name}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
          content: JSON.stringify(formattedResults, null, 2)
        };
      default:
        throw new HttpError(400, `Unsupported export format: ${format}`);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error exporting results:", error);
    throw new HttpError(500, "Failed to export results");
  }
};
function generateCSV(data) {
  if (data.length === 0) {
    return "";
  }
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(",");
  const rows = data.map((item) => {
    return headers.map((header) => {
      const value = item[header]?.toString() || "";
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });
  return [headerRow, ...rows].join("\n");
}

async function exportResults$1(args, context) {
  return exportResults$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      ProcessedResult: dbClient.processedResult,
      RawSearchResult: dbClient.rawSearchResult,
      SearchQuery: dbClient.searchQuery,
      ReviewTagAssignment: dbClient.reviewTagAssignment,
      ReviewTag: dbClient.reviewTag,
      Note: dbClient.note
    }
  });
}

var exportResults = createAction(exportResults$1);

const updateUserProfile$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  const { email, role, organizationId } = args;
  if (email && !isValidEmail(email)) {
    throw new HttpError(400, "Invalid email format");
  }
  if (email) {
    const existingUser = await context.entities.User.findUnique({
      where: { email }
    });
    if (existingUser && existingUser.id !== context.user.id) {
      throw new HttpError(400, "Email is already in use");
    }
  }
  const updateData = {};
  if (email !== void 0) updateData.email = email;
  try {
    const updatedUser = await context.entities.User.update({
      where: { id: context.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        organizationId: true,
        updatedAt: true
      }
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new HttpError(500, "Failed to update user profile");
  }
};
const changePassword$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  const { currentPassword, newPassword } = args;
  if (!newPassword || newPassword.length < 8) {
    throw new HttpError(400, "New password must be at least 8 characters long");
  }
  try {
    const user = await context.entities.User.findUnique({
      where: { id: context.user.id },
      select: { password: true }
    });
    const passwordValid = await context.auth.verifyPassword(
      currentPassword,
      user.password
    );
    if (!passwordValid) {
      throw new HttpError(400, "Current password is incorrect");
    }
    const hashedPassword = await context.auth.hashPassword(newPassword);
    await context.entities.User.update({
      where: { id: context.user.id },
      data: { password: hashedPassword }
    });
    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error changing password:", error);
    throw new HttpError(500, "Failed to change password");
  }
};
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function updateUserProfile$1(args, context) {
  return updateUserProfile$2(args, {
    ...context,
    entities: {
      User: dbClient.user
    }
  });
}

var updateUserProfile = createAction(updateUserProfile$1);

async function changePassword$1(args, context) {
  return changePassword$2(args, {
    ...context,
    entities: {
      User: dbClient.user
    }
  });
}

var changePassword = createAction(changePassword$1);

const createSearchSession$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  const { name, description, teamId } = args;
  if (!name || name.trim() === "") {
    throw new HttpError(400, "Name is required");
  }
  const data = {
    name,
    description,
    userId: context.user.id
  };
  if (teamId) {
    data.teamId = teamId;
  }
  try {
    const prisma = context.entities._prisma;
    const [newSession, updatedUser] = await prisma.$transaction(async (tx) => {
      const session = await tx.searchSession.create({
        data,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      });
      let user = null;
      if (context.user.role === "Researcher") {
        user = await tx.user.update({
          where: { id: context.user.id },
          data: { role: ROLES.LEAD_REVIEWER },
          select: { id: true, role: true }
        });
        console.log(`User ${context.user.id} promoted to Lead Reviewer`);
      }
      return [session, user];
    });
    return newSession;
  } catch (error) {
    console.error("Error creating search session:", error);
    throw new HttpError(500, "Failed to create search session");
  }
};
const createSearchQuery$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  const { sessionId, query, description, queryType, structuredData } = args;
  if (!sessionId) {
    throw new HttpError(400, "Session ID is required");
  }
  if (!query || query.trim() === "") {
    throw new HttpError(400, "Query string is required");
  }
  const session = await context.entities.SearchSession.findFirst({
    where: {
      id: sessionId,
      // This is where we'll add team access in Phase 2
      userId: context.user.id
    }
  });
  if (!session) {
    throw new HttpError(404, "Search session not found or access denied");
  }
  const data = {
    query,
    description,
    sessionId
  };
  if (queryType) {
    data.queryType = queryType;
  }
  if (structuredData) {
    data.structuredData = structuredData;
  }
  try {
    const newQuery = await context.entities.SearchQuery.create({
      data,
      select: {
        id: true,
        query: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        sessionId: true
      }
    });
    return newQuery;
  } catch (error) {
    console.error("Error creating search query:", error);
    throw new HttpError(500, "Failed to create search query");
  }
};
const updateSearchQuery$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  const { id, query, description, queryType, structuredData } = args;
  if (!id) {
    throw new HttpError(400, "Query ID is required");
  }
  const existingQuery = await context.entities.SearchQuery.findFirst({
    where: {
      id,
      searchSession: {
        // This is where we'll add team access in Phase 2
        userId: context.user.id
      }
    },
    include: {
      searchSession: true
    }
  });
  if (!existingQuery) {
    throw new HttpError(404, "Search query not found or access denied");
  }
  const data = {};
  if (query !== void 0) data.query = query;
  if (description !== void 0) data.description = description;
  if (queryType !== void 0) data.queryType = queryType;
  if (structuredData !== void 0) data.structuredData = structuredData;
  try {
    const updatedQuery = await context.entities.SearchQuery.update({
      where: { id },
      data,
      select: {
        id: true,
        query: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        sessionId: true,
        queryType: true,
        structuredData: true
      }
    });
    return updatedQuery;
  } catch (error) {
    console.error("Error updating search query:", error);
    throw new HttpError(500, "Failed to update search query");
  }
};

async function createSearchSession$1(args, context) {
  return createSearchSession$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession
    }
  });
}

var createSearchSession = createAction(createSearchSession$1);

async function createSearchQuery$1(args, context) {
  return createSearchQuery$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      SearchQuery: dbClient.searchQuery
    }
  });
}

var createSearchQuery = createAction(createSearchQuery$1);

async function updateSearchQuery$1(args, context) {
  return updateSearchQuery$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      SearchQuery: dbClient.searchQuery
    }
  });
}

var updateSearchQuery = createAction(updateSearchQuery$1);

const getRawResults$2 = async ({ sessionId, queryId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    const where = { searchQuery: { sessionId } };
    if (queryId) {
      where.queryId = queryId;
    }
    const rawResults = await context.entities.RawSearchResult.findMany({
      where,
      include: {
        searchQuery: {
          select: {
            query: true,
            description: true
          }
        },
        processedResult: {
          select: {
            id: true
          }
        }
      },
      orderBy: { rank: "asc" }
    });
    return rawResults;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error fetching raw results:", error);
    throw new HttpError(500, "Failed to fetch raw results");
  }
};
const getProcessedResults$2 = async ({ sessionId, includeTagged = false }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    const where = { sessionId };
    if (!includeTagged) {
      where.reviewTags = { none: {} };
    }
    const processedResults = await context.entities.ProcessedResult.findMany({
      where,
      include: {
        rawSearchResult: {
          select: {
            searchQuery: {
              select: {
                query: true
              }
            },
            rank: true,
            searchEngine: true
          }
        },
        reviewTags: {
          include: {
            tag: true
          }
        },
        notes: {
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: { title: "asc" }
    });
    return processedResults;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error fetching processed results:", error);
    throw new HttpError(500, "Failed to fetch processed results");
  }
};

async function getRawResults$1(args, context) {
  return getRawResults$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      RawSearchResult: dbClient.rawSearchResult,
      SearchQuery: dbClient.searchQuery,
      ProcessedResult: dbClient.processedResult
    }
  });
}

var getRawResults = createQuery(getRawResults$1);

async function getProcessedResults$1(args, context) {
  return getProcessedResults$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      ProcessedResult: dbClient.processedResult,
      RawSearchResult: dbClient.rawSearchResult,
      SearchQuery: dbClient.searchQuery,
      ReviewTagAssignment: dbClient.reviewTagAssignment,
      ReviewTag: dbClient.reviewTag,
      Note: dbClient.note
    }
  });
}

var getProcessedResults = createQuery(getProcessedResults$1);

const getReviewTags$2 = async ({ sessionId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    return await context.entities.ReviewTag.findMany({
      where: { sessionId },
      orderBy: { name: "asc" }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error fetching review tags:", error);
    throw new HttpError(500, "Failed to fetch review tags");
  }
};
const getResultsWithTags$2 = async ({
  sessionId,
  tagId = null,
  untaggedOnly = false,
  page = 1,
  limit = 20
}, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    const where = { sessionId };
    if (tagId) {
      where.reviewTags = {
        some: {
          tagId
        }
      };
    } else if (untaggedOnly) {
      where.reviewTags = {
        none: {}
      };
    }
    const totalCount = await context.entities.ProcessedResult.count({ where });
    const results = await context.entities.ProcessedResult.findMany({
      where,
      include: {
        reviewTags: {
          include: {
            tag: true
          }
        },
        notes: {
          orderBy: {
            createdAt: "desc"
          }
        },
        rawSearchResult: {
          select: {
            searchQuery: {
              select: {
                query: true
              }
            }
          }
        }
      },
      orderBy: { title: "asc" },
      skip: (page - 1) * limit,
      take: limit
    });
    return {
      results,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error fetching results with tags:", error);
    throw new HttpError(500, "Failed to fetch results");
  }
};

async function getReviewTags$1(args, context) {
  return getReviewTags$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      ReviewTag: dbClient.reviewTag
    }
  });
}

var getReviewTags = createQuery(getReviewTags$1);

async function getResultsWithTags$1(args, context) {
  return getResultsWithTags$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      ProcessedResult: dbClient.processedResult,
      ReviewTagAssignment: dbClient.reviewTagAssignment,
      ReviewTag: dbClient.reviewTag,
      Note: dbClient.note,
      RawSearchResult: dbClient.rawSearchResult,
      SearchQuery: dbClient.searchQuery
    }
  });
}

var getResultsWithTags = createQuery(getResultsWithTags$1);

const getReportData$2 = async ({ sessionId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  try {
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId },
      include: {
        searchQueries: true
      }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found");
    }
    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }
    const rawResultsCount = await context.entities.RawSearchResult.count({
      where: {
        searchQuery: {
          sessionId
        }
      }
    });
    const processedResultsCount = await context.entities.ProcessedResult.count({
      where: { sessionId }
    });
    const tags = await context.entities.ReviewTag.findMany({
      where: { sessionId },
      include: {
        assignments: {
          select: {
            id: true
          }
        }
      }
    });
    const tagCounts = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      count: tag.assignments.length
    }));
    const duplicatesCount = await context.entities.DuplicateRelationship.count({
      where: {
        OR: [
          { primaryResult: { sessionId } },
          { duplicateResult: { sessionId } }
        ]
      }
    });
    const taggedResultsCount = await context.entities.ProcessedResult.count({
      where: {
        sessionId,
        reviewTags: {
          some: {}
        }
      }
    });
    const untaggedResultsCount = processedResultsCount - taggedResultsCount;
    const fileTypeResults = await context.entities.ProcessedResult.findMany({
      where: { sessionId },
      select: {
        metadata: true
      }
    });
    const fileTypeCounts = {};
    fileTypeResults.forEach((result) => {
      const fileType = result.metadata.fileType || "unknown";
      fileTypeCounts[fileType] = (fileTypeCounts[fileType] || 0) + 1;
    });
    return {
      summary: {
        name: session.name,
        description: session.description,
        queriesCount: session.searchQueries.length,
        rawResultsCount,
        processedResultsCount,
        taggedResultsCount,
        untaggedResultsCount,
        duplicatesCount
      },
      queries: session.searchQueries,
      tags: tagCounts,
      fileTypes: Object.entries(fileTypeCounts).map(([type, count]) => ({ type, count }))
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error fetching report data:", error);
    throw new HttpError(500, "Failed to fetch report data");
  }
};

async function getReportData$1(args, context) {
  return getReportData$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      SearchQuery: dbClient.searchQuery,
      RawSearchResult: dbClient.rawSearchResult,
      ProcessedResult: dbClient.processedResult,
      ReviewTag: dbClient.reviewTag,
      ReviewTagAssignment: dbClient.reviewTagAssignment,
      DuplicateRelationship: dbClient.duplicateRelationship
    }
  });
}

var getReportData = createQuery(getReportData$1);

const getUserProfile$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  try {
    const user = await context.entities.User.findUnique({
      where: { id: context.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Phase 2 fields
        role: true,
        organizationId: true
        // In Phase 2, we would also include organization data:
        // organization: {
        //   select: {
        //     id: true,
        //     name: true
        //   }
        // }
      }
    });
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Failed to fetch user profile");
  }
};
const getUserSearchSessions$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  try {
    const whereClause = { userId: context.user.id };
    if (args?.isTemplate !== void 0) {
      whereClause.isTemplate = args.isTemplate;
    }
    const sessions = await context.entities.SearchSession.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        // Phase 2 fields
        teamId: true,
        isTemplate: true,
        _count: {
          select: {
            searchQueries: true,
            processedResults: true
          }
        }
      }
    });
    return sessions;
  } catch (error) {
    console.error("Error fetching user search sessions:", error);
    throw new HttpError(500, "Failed to fetch search sessions");
  }
};

async function getUserProfile$1(args, context) {
  return getUserProfile$2(args, {
    ...context,
    entities: {
      User: dbClient.user
    }
  });
}

var getUserProfile = createQuery(getUserProfile$1);

async function getUserSearchSessions$1(args, context) {
  return getUserSearchSessions$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      SearchQuery: dbClient.searchQuery,
      ProcessedResult: dbClient.processedResult
    }
  });
}

var getUserSearchSessions = createQuery(getUserSearchSessions$1);

const getSearchSessions$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  const whereClause = { userId: context.user.id };
  try {
    const sessions = await context.entities.SearchSession.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        // Phase 2 fields removed
        _count: {
          select: {
            searchQueries: true,
            processedResults: true
          }
        }
      }
    });
    return sessions;
  } catch (error) {
    console.error("Error fetching search sessions:", error);
    throw new HttpError(500, "Failed to fetch search sessions");
  }
};
const getSearchSession$2 = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authorized");
  }
  const { id } = args;
  if (!id) {
    throw new HttpError(400, "Session ID is required");
  }
  try {
    const session = await context.entities.SearchSession.findFirst({
      where: {
        id,
        // This is where we'll add team access check in Phase 2
        userId: context.user.id
      },
      include: {
        searchQueries: {
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: {
            searchQueries: true,
            processedResults: true
          }
        }
      }
    });
    if (!session) {
      throw new HttpError(404, "Search session not found or access denied");
    }
    return session;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error fetching search session:", error);
    throw new HttpError(500, "Failed to fetch search session");
  }
};

async function getSearchSessions$1(args, context) {
  return getSearchSessions$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      SearchQuery: dbClient.searchQuery,
      ProcessedResult: dbClient.processedResult
    }
  });
}

var getSearchSessions = createQuery(getSearchSessions$1);

async function getSearchSession$1(args, context) {
  return getSearchSession$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      SearchSession: dbClient.searchSession,
      SearchQuery: dbClient.searchQuery,
      ProcessedResult: dbClient.processedResult
    }
  });
}

var getSearchSession = createQuery(getSearchSession$1);

const router$3 = express.Router();
router$3.post("/execute-search-query", auth, executeSearchQuery);
router$3.post("/process-session-results", auth, processSessionResults);
router$3.post("/create-review-tag", auth, createReviewTag);
router$3.post("/assign-tag", auth, assignTag);
router$3.post("/create-note", auth, createNote);
router$3.post("/export-results", auth, exportResults);
router$3.post("/update-user-profile", auth, updateUserProfile);
router$3.post("/change-password", auth, changePassword);
router$3.post("/create-search-session", auth, createSearchSession);
router$3.post("/create-search-query", auth, createSearchQuery);
router$3.post("/update-search-query", auth, updateSearchQuery);
router$3.post("/get-raw-results", auth, getRawResults);
router$3.post("/get-processed-results", auth, getProcessedResults);
router$3.post("/get-review-tags", auth, getReviewTags);
router$3.post("/get-results-with-tags", auth, getResultsWithTags);
router$3.post("/get-report-data", auth, getReportData);
router$3.post("/get-user-profile", auth, getUserProfile);
router$3.post("/get-user-search-sessions", auth, getUserSearchSessions);
router$3.post("/get-search-sessions", auth, getSearchSessions);
router$3.post("/get-search-session", auth, getSearchSession);

const _waspGlobalMiddlewareConfigFn = (mc) => mc;
const defaultGlobalMiddlewareConfig = /* @__PURE__ */ new Map([
  ["helmet", helmet()],
  ["cors", cors({ origin: config$1.allowedCORSOrigins })],
  ["logger", logger("dev")],
  ["express.json", express.json()],
  ["express.urlencoded", express.urlencoded({ extended: false })],
  ["cookieParser", cookieParser()]
]);
const globalMiddlewareConfig = _waspGlobalMiddlewareConfigFn(defaultGlobalMiddlewareConfig);
function globalMiddlewareConfigForExpress(middlewareConfigFn) {
  {
    return Array.from(globalMiddlewareConfig.values());
  }
}

var me = handleRejection(async (req, res) => {
  if (req.user) {
    return res.json(serialize(req.user));
  } else {
    throw createInvalidCredentialsError();
  }
});

var logout = handleRejection(async (req, res) => {
  if (req.sessionId) {
    await invalidateSession(req.sessionId);
    return res.json({ success: true });
  } else {
    throw createInvalidCredentialsError();
  }
});

const onBeforeSignup = async ({ providerId, req, prisma }) => {
  console.log("Signup request received for provider ID:", providerId);
  if (providerId.providerName === "email" && req.body?.email) {
    const email = req.body.email;
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw new HttpError(400, "Validation failed: Email is already in use.");
    }
  }
  const userData = req.body;
  if (userData.role && userData.role !== "Researcher") {
    console.log(`User requesting non-default role: ${userData.role}`);
  }
};

const onBeforeSignupHook = (params) => onBeforeSignup({
  prisma: dbClient,
  ...params
});
const onAfterSignupHook = async (_params) => {
};
const onBeforeLoginHook = async (_params) => {
};
const onAfterLoginHook = async (_params) => {
};

var login = handleRejection(async (req, res) => {
  const fields = req.body ?? {};
  ensureValidArgs$1(fields);
  const providerId = createProviderId("username", fields.username);
  const authIdentity = await findAuthIdentity(providerId);
  if (!authIdentity) {
    throw createInvalidCredentialsError();
  }
  try {
    const providerData = getProviderDataWithPassword(authIdentity.providerData);
    await verifyPassword(providerData.hashedPassword, fields.password);
  } catch (e) {
    throw createInvalidCredentialsError();
  }
  const auth = await findAuthWithUserBy({
    id: authIdentity.authId
  });
  if (auth === null) {
    throw createInvalidCredentialsError();
  }
  await onBeforeLoginHook({
    req,
    providerId,
    user: auth.user
  });
  const session = await createSession(auth.id);
  await onAfterLoginHook({
    req,
    providerId,
    user: auth.user
  });
  return res.json({
    sessionId: session.id
  });
});
function ensureValidArgs$1(args) {
  ensureValidUsername(args);
  ensurePasswordIsPresent(args);
}

function getSignupRoute({
  userSignupFields
}) {
  return handleRejection(async function signup(req, res) {
    const fields = req.body ?? {};
    ensureValidArgs(fields);
    const userFields = await validateAndGetUserFields(
      fields,
      userSignupFields
    );
    const providerId = createProviderId("username", fields.username);
    const providerData = await sanitizeAndSerializeProviderData({
      hashedPassword: fields.password
    });
    try {
      await onBeforeSignupHook({ req, providerId });
      const user = await createUser(
        providerId,
        providerData,
        // Using any here because we want to avoid TypeScript errors and
        // rely on Prisma to validate the data.
        userFields
      );
      await onAfterSignupHook({ req, providerId, user });
    } catch (e) {
      rethrowPossibleAuthError(e);
    }
    return res.json({ success: true });
  });
}
function ensureValidArgs(args) {
  ensureValidUsername(args);
  ensurePasswordIsPresent(args);
  ensureValidPassword(args);
}

const userSignupFields = {
  username: async (data) => {
    if (!data.username) {
      throw new Error("Username is required");
    }
    return data.username;
  },
  role: async (data) => {
    const validRoles = ["Researcher", "Admin"];
    const providedRole = data.role ? String(data.role).trim() : "";
    const role = validRoles.includes(providedRole) ? providedRole : "Researcher";
    if (providedRole && !validRoles.includes(providedRole)) {
      console.warn(`Invalid role "${providedRole}" provided during signup. Defaulting to 'Researcher'.`);
    }
    return role;
  }
};

const _waspUserSignupFields = userSignupFields;
const config = {
  id: "username",
  displayName: "Username and password",
  createRouter() {
    const router = Router();
    router.post("/login", login);
    const signupRoute = getSignupRoute({
      userSignupFields: _waspUserSignupFields
    });
    router.post("/signup", signupRoute);
    return router;
  }
};

const providers = [
  config
];
const router$2 = Router();
for (const provider of providers) {
  const { createRouter } = provider;
  const providerRouter = createRouter(provider);
  router$2.use(`/${provider.id}`, providerRouter);
  console.log(`\u{1F680} "${provider.displayName}" auth initialized`);
}

const router$1 = express.Router();
router$1.get("/me", auth, me);
router$1.post("/logout", auth, logout);
router$1.use("/", router$2);

const router = express.Router();
const middleware = globalMiddlewareConfigForExpress();
router.get("/", middleware, function(_req, res) {
  res.status(200).send();
});
router.use("/auth", middleware, router$1);
router.use("/operations", middleware, router$3);

const app = express();
app.use("/", router);
app.use((err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message, data: err.data });
  }
  return next(err);
});

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = webcrypto;
}

const startServer = async () => {
  const port = normalizePort(config$1.port);
  app.set("port", port);
  const server = http.createServer(app);
  server.listen(port);
  server.on("error", (error) => {
    if (error.syscall !== "listen") throw error;
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
      default:
        throw error;
    }
  });
  server.on("listening", () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Server listening on " + bind);
  });
};
startServer().catch((e) => console.error(e));
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
//# sourceMappingURL=server.js.map
