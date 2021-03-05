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
exports.getSwaps = exports.getReserves = exports.getTopPairs = exports.get24HoursAgo = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var blacklist_1 = __importDefault(require("../constants/blacklist"));
var client_1 = __importDefault(require("./apollo/client"));
var queries_1 = require("./apollo/queries");
var queries_2 = require("./blocks/queries");
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
function get24HoursAgo() {
    return Math.floor((Date.now() - DAY) / 1000);
}
exports.get24HoursAgo = get24HoursAgo;
function getTopPairs(limit) {
    var _a, _b;
    if (limit === void 0) { limit = 10; }
    return __awaiter(this, void 0, void 0, function () {
        var epochSecond, firstBlock, _c, pairs, topPairsErrors, _d, pairVolumes, yesterdayVolumeErrors, yesterdayVolumeIndex, result;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    epochSecond = Math.floor(new Date().getTime() / SECOND);
                    console.log('EPOCH: ' + epochSecond);
                    return [4 /*yield*/, queries_2.getBlockFromTimestamp(epochSecond - DAY)];
                case 1:
                    firstBlock = _e.sent();
                    console.log('FIRST BLOCK: ' + firstBlock);
                    if (!firstBlock)
                        throw new Error('first block was not fetched');
                    return [4 /*yield*/, client_1.default.query({
                            query: queries_1.TOP_PAIRS,
                            variables: {
                                limit: limit,
                                excludeTokenIds: blacklist_1.default
                            },
                            fetchPolicy: 'no-cache'
                        })];
                case 2:
                    _c = _e.sent(), pairs = _c.data.pairs, topPairsErrors = _c.errors;
                    if (topPairsErrors && topPairsErrors.length > 0)
                        throw new Error('Failed to fetch top pairs from the subgraph');
                    return [4 /*yield*/, client_1.default.query({
                            query: queries_1.PAIRS_VOLUME_QUERY,
                            variables: {
                                limit: limit,
                                pairIds: pairs.map(function (pair) { return pair.id; }),
                                blockNumber: +firstBlock
                            },
                            fetchPolicy: 'no-cache'
                        })];
                case 3:
                    _d = _e.sent(), pairVolumes = _d.data.pairVolumes, yesterdayVolumeErrors = _d.errors;
                    if (yesterdayVolumeErrors && yesterdayVolumeErrors.length > 0)
                        throw new Error("Failed to get volume info for 24h ago from the subgraph");
                    yesterdayVolumeIndex = (_a = pairVolumes === null || pairVolumes === void 0 ? void 0 : pairVolumes.reduce(function (memo, pair) {
                        memo[pair.id] = {
                            volumeToken0: new bignumber_js_1.default(pair.volumeToken0),
                            volumeToken1: new bignumber_js_1.default(pair.volumeToken1)
                        };
                        return memo;
                    }, {})) !== null && _a !== void 0 ? _a : {};
                    result = (_b = pairs === null || pairs === void 0 ? void 0 : pairs.map(function (pair) {
                        var yesterday = yesterdayVolumeIndex[pair.id];
                        // Check if pair has yesterday volume
                        if (yesterday) {
                            if (yesterday.volumeToken0.gt(pair.volumeToken0)) {
                                throw new Error("Invalid subgraph response: pair " + pair.id + " returned volumeToken0 < yesterday.volumeToken0");
                            }
                            if (yesterday.volumeToken1.gt(pair.volumeToken1)) {
                                throw new Error("Invalid subgraph response: pair " + pair.id + " returned volumeToken1 < yesterday.volumeToken1");
                            }
                        }
                        return __assign(__assign({}, pair), { price: pair.reserve0 !== '0' && pair.reserve1 !== '0' ?
                                new bignumber_js_1.default(pair.reserve1).dividedBy(pair.reserve0).toString() : undefined, previous24hVolumeToken0: pair.volumeToken0 && (yesterday === null || yesterday === void 0 ? void 0 : yesterday.volumeToken0) ?
                                new bignumber_js_1.default(pair.volumeToken0).minus(yesterday.volumeToken0) : new bignumber_js_1.default(pair.volumeToken0), previous24hVolumeToken1: pair.volumeToken1 && (yesterday === null || yesterday === void 0 ? void 0 : yesterday.volumeToken1) ?
                                new bignumber_js_1.default(pair.volumeToken1).minus(yesterday.volumeToken1) : new bignumber_js_1.default(pair.volumeToken1) });
                    })) !== null && _b !== void 0 ? _b : [];
                    // console.log(result);
                    /*
                      {
                      __typename: 'Pair',
                      id: '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974',
                      reserve0: '1513834.825146948486966376',
                      reserve1: '26738.239416309980799041',
                      token0: {
                        __typename: 'Token',
                        id: '0x514910771af9ca656af840dff83e8264ecf986ca',
                        name: 'ChainLink Token',
                        symbol: 'LINK'
                      },
                      token1: {
                        __typename: 'Token',
                        id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        name: 'Wrapped Ether',
                        symbol: 'WETH'
                      },
                      volumeToken0: '110345682.341163534719860952',
                      volumeToken1: '2681909.241429159407562059',
                      price: '0.01766258707498982946',
                      previous24hVolumeToken0: BigNumber { s: 1, e: 5, c: [Array] },
                      previous24hVolumeToken1: BigNumber { s: 1, e: 3, c: [Array] }
                    }
                    */
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.getTopPairs = getTopPairs;
function isSorted(tokenA, tokenB) {
    return tokenA.toLowerCase() < tokenB.toLowerCase();
}
function sortedFormatted(tokenA, tokenB) {
    return isSorted(tokenA, tokenB)
        ? [tokenA.toLowerCase(), tokenB.toLowerCase()]
        : [tokenB.toLowerCase(), tokenA.toLowerCase()];
}
// returns reserves of token a and b in the order they are queried
function getReserves(tokenA, tokenB) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, token0, token1;
        return __generator(this, function (_b) {
            _a = sortedFormatted(tokenA, tokenB), token0 = _a[0], token1 = _a[1];
            return [2 /*return*/, client_1.default
                    .query({
                    query: queries_1.PAIR_RESERVES_BY_TOKENS,
                    variables: {
                        token0: token0,
                        token1: token1
                    }
                })
                    .then(function (_a) {
                    var _b = _a.data.pairs[0], reserve0 = _b.reserve0, reserve1 = _b.reserve1;
                    if (tokenA.toLowerCase() === token0) {
                        return [
                            reserve0,
                            reserve1
                        ];
                    }
                    return [
                        reserve1,
                        reserve0
                    ];
                })];
        });
    });
}
exports.getReserves = getReserves;
// Gets the swaps (aka trades) done on tokenA x tokenB
function getSwaps(tokenA, tokenB) {
    return __awaiter(this, void 0, void 0, function () {
        var _24HoursAgo, _a, token0, token1, pairAddress, sorted, skip, results, finished;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _24HoursAgo = Math.floor((Date.now() - DAY) / SECOND);
                    _a = sortedFormatted(tokenA, tokenB), token0 = _a[0], token1 = _a[1];
                    return [4 /*yield*/, client_1.default.query({
                            query: queries_1.PAIR_FROM_TOKENS,
                            variables: { token0: token0, token1: token1 }
                        })];
                case 1:
                    pairAddress = (_b.sent()).data.pairs[0].id;
                    sorted = isSorted(tokenA, tokenB);
                    skip = 0;
                    results = [];
                    finished = false;
                    _b.label = 2;
                case 2:
                    if (!!finished) return [3 /*break*/, 4];
                    return [4 /*yield*/, client_1.default.query({
                            query: queries_1.SWAPS_BY_PAIR,
                            variables: { skip: skip, pairAddress: pairAddress, timestamp: _24HoursAgo }
                        }).then(function (_a) {
                            var swaps = _a.data.swaps;
                            if (!swaps || swaps.length === 0) {
                                // No more swaps found for last 24 hours - end the query
                                finished = true;
                            }
                            else {
                                // If not finished fetch the next set
                                skip += swaps.length;
                                results = results.concat(swaps.map(function (swap) { return (__assign(__assign({}, swap), { amountAIn: sorted ? swap.amount0In : swap.amount1In, amountAOut: sorted ? swap.amount0Out : swap.amount1Out, amountBIn: sorted ? swap.amount1In : swap.amount0In, amountBOut: sorted ? swap.amount1Out : swap.amount0Out })); }));
                            }
                        })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 2];
                case 4: 
                // console.log(results);
                /*
                  {
                    id: '0x6b986af851e011278e7b61199c9ee3ffd774b482cae70f94fb2f31ab8078c47f-0',
                    timestamp: '1613492168',
                    amount0In: '0',
                    amount0Out: '2.66004617',
                    amount1In: '73.763848941712794272',
                    amount1Out: '0',
                    __typename: 'Swap',
                    amountAIn: '0',
                    amountAOut: '2.66004617',
                    amountBIn: '73.763848941712794272',
                    amountBOut: '0'
                  },
                */
                return [2 /*return*/, results];
            }
        });
    });
}
exports.getSwaps = getSwaps;
