"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var address_1 = require("@ethersproject/address");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var response_1 = require("../utils/response");
var _shared_1 = require("./_shared");
var computeBidsAsks_1 = require("../utils/computeBidsAsks");
exports.handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tokenA, tokenB, idA, idB, _b, reservesA, reservesB, timestamp, reponseBody, error_1;
    var _c;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                // Validate that the pair given is valid
                if (!((_d = event.pathParameters) === null || _d === void 0 ? void 0 : _d.pair) || !/^0x[0-9a-fA-F]{40}_0x[0-9a-fA-F]{40}$/.test(event.pathParameters.pair)) {
                    return [2 /*return*/, response_1.createBadRequestResponse('Invalid pair identifier: must be of format tokenAddress_tokenAddress')];
                }
                _a = (_e = event.pathParameters) === null || _e === void 0 ? void 0 : _e.pair.split('_'), tokenA = _a[0], tokenB = _a[1];
                try {
                    ;
                    _c = [
                        address_1.getAddress(tokenA),
                        address_1.getAddress(tokenB)
                    ], idA = _c[0], idB = _c[1];
                }
                catch (error) {
                    return [2 /*return*/, response_1.createBadRequestResponse('Invalid pair identifier: both addresses must be *checksummed*')];
                }
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 4]);
                return [4 /*yield*/, _shared_1.getReserves(idA, idB)];
            case 2:
                _b = _f.sent(), reservesA = _b[0], reservesB = _b[1];
                timestamp = new Date().getTime();
                reponseBody = __assign({ timestamp: timestamp,
                    tokenA: tokenA,
                    tokenB: tokenB }, computeBidsAsks_1.computeBidsAsks(new bignumber_js_1.default(reservesA), new bignumber_js_1.default(reservesB)));
                return [2 /*return*/, response_1.createSuccessResponse(reponseBody)];
            case 3:
                error_1 = _f.sent();
                return [2 /*return*/, response_1.createServerErrorResponse(error_1)];
            case 4: return [2 /*return*/];
        }
    });
}); };
