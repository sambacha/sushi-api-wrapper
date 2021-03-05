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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var address_1 = require("@ethersproject/address");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var _shared_1 = require("./_shared");
var response_1 = require("../utils/response");
exports.handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tokenA, tokenB, idA, idB, swaps, responseBody, error_1;
    var _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // Validate the pair tokenA_tokenB given
                if (!((_c = event.pathParameters) === null || _c === void 0 ? void 0 : _c.pair) || !/^0x[0-9a-fA-F]{40}_0x[0-9a-fA-F]{40}$/.test(event.pathParameters.pair)) {
                    return [2 /*return*/, response_1.createBadRequestResponse('Invalid pair identifier: must be of format tokenAddress_tokenAddress')];
                }
                _a = event.pathParameters.pair.split('_'), tokenA = _a[0], tokenB = _a[1];
                try {
                    // Validate correct ethereum addresses
                    ;
                    _b = [
                        address_1.getAddress(tokenA),
                        address_1.getAddress(tokenB)
                    ], idA = _b[0], idB = _b[1];
                }
                catch (error) {
                    return [2 /*return*/, response_1.createBadRequestResponse('Invalid pair identifier: both asset identifiers must be *checksummed* addresses')];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, _shared_1.getSwaps(idA, idB)];
            case 2:
                swaps = _d.sent();
                responseBody = swaps.map(function (swap) {
                    // console.log(swap);
                    /*
                    {
                      id: '0xdaf6c1defccfaecfc16a5d6f3536cf28e8e518a2cbc9c397a5f6e8ea1c412fc8-1',
                      timestamp: '1613573016',
                      amount0In: '0',
                      amount0Out: '0.1973464',
                      amount1In: '5.556753823044423889',
                      amount1Out: '0',
                      __typename: 'Swap',
                      amountAIn: '0',
                      amountAOut: '0.1973464',
                      amountBIn: '5.556753823044423889',
                      amountBOut: '0'
                    }
                    */
                    var aIn = swap.amountAIn !== '0';
                    var aOut = swap.amountAOut !== '0';
                    var bIn = swap.amountBIn !== '0';
                    var bOut = swap.amountBOut !== '0';
                    // Token A is the base - if the pair sends A and not B then it's a "BUY"
                    // BUY = Token A OUT && Token B IN
                    var isBuy = aOut && bIn && !aIn && !bOut;
                    // SELL = Token A IN && Token B OUT
                    var isSell = !aOut && !bIn && aIn && bOut;
                    // BORROW = Token A IN+OUT && Token B IN+OUT
                    var isBorrowBoth = aOut && bOut && aIn && bIn;
                    // For trades there's either a BUY, SELL, BORROW-BOTH or UNKNOWN
                    var type = isBuy ? 'buy' : isSell ? 'sell' : isBorrowBoth ? 'borrow-both' : '???';
                    // Figure the base and quote amount
                    var baseAmount = aOut ? swap.amountAOut : swap.amountAIn;
                    var quoteAmount = bOut ? swap.amountBOut : swap.amountBIn;
                    var price;
                    // price = baseAmount !== '0' ? new BigNumber(quoteAmount).dividedBy(new BigNumber(baseAmount)).toString() : undefined;
                    // console.log('A: ' + price);
                    var calc = undefined;
                    if (baseAmount !== '0') {
                        calc = new bignumber_js_1.default(quoteAmount);
                        price = calc.dividedBy(new bignumber_js_1.default(baseAmount)).toString();
                    }
                    // console.log('B: ' + price);
                    return {
                        trade_id: swap.id,
                        base_volume: baseAmount,
                        quote_volume: quoteAmount,
                        type: type,
                        trade_timestamp: swap.timestamp,
                        price: price
                    };
                });
                return [2 /*return*/, response_1.createSuccessResponse(responseBody)];
            case 3:
                error_1 = _d.sent();
                return [2 /*return*/, response_1.createServerErrorResponse(error_1)];
            case 4: return [2 /*return*/];
        }
    });
}); };
