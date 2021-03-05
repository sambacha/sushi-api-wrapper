"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var address_1 = require("@ethersproject/address");
var response_1 = require("../utils/response");
var _shared_1 = require("./_shared");
exports.handler = function () { return __awaiter(void 0, void 0, void 0, function () {
    var pairs, responseBody, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, _shared_1.getTopPairs(5)];
            case 1:
                pairs = _a.sent();
                console.log("TICKERS OBTAINED " + pairs.length + " PAIRS");
                responseBody = pairs.reduce(function (accumulator, pair) {
                    var _a;
                    var id0 = address_1.getAddress(pair.token0.id);
                    var id1 = address_1.getAddress(pair.token1.id);
                    console.log(id0, id1);
                    accumulator[id0 + "_" + id1] = {
                        base_id: id0,
                        base_name: pair.token0.name,
                        base_symbol: pair.token0.symbol,
                        quote_id: id1,
                        quote_name: pair.token1.name,
                        quote_symbol: pair.token1.symbol,
                        last_price: (_a = pair.price) !== null && _a !== void 0 ? _a : '0',
                        base_volume: pair.previous24hVolumeToken0.toString(),
                        quote_volume: pair.previous24hVolumeToken1.toString()
                    };
                    return accumulator;
                }, {});
                return [2 /*return*/, response_1.createSuccessResponse(responseBody)];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, response_1.createServerErrorResponse(error_1)];
            case 3: return [2 /*return*/];
        }
    });
}); };
