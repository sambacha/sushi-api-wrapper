"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerErrorResponse = exports.createBadRequestResponse = exports.createErrorResponse = exports.createSuccessResponse = exports.createResponse = void 0;
function createResponse(statusCode, body) {
    return {
        body: JSON.stringify(body),
        statusCode: statusCode,
        headers: {
            'content-type': 'application/json'
        }
    };
}
exports.createResponse = createResponse;
function createSuccessResponse(body) {
    return createResponse(200, body);
}
exports.createSuccessResponse = createSuccessResponse;
function createErrorResponse(code, message) {
    return createResponse(code, { errorCode: code, message: message });
}
exports.createErrorResponse = createErrorResponse;
function createBadRequestResponse(message) {
    if (message === void 0) { message = 'Bad request'; }
    return createErrorResponse(400, message);
}
exports.createBadRequestResponse = createBadRequestResponse;
function createServerErrorResponse(error) {
    return createErrorResponse(500, error.message);
}
exports.createServerErrorResponse = createServerErrorResponse;
