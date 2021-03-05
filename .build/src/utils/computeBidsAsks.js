"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBidsAsks = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
function getAmountOut(amountIn, reservesIn, reservesOut) {
    var amountOut = new bignumber_js_1.default(0);
    if (!amountIn.eq(0)) {
        // amountOut = reservesOut.minus(
        //     reservesOut.multipliedBy(reservesIn).dividedBy(
        //       reservesIn.plus(amountIn.multipliedBy(0.997))
        //   )
        // );
        // console.log('A: ' + amountOut);
        var calc = amountIn.multipliedBy(0.997); // Multiply the fee
        calc = reservesIn.plus(calc);
        calc = reservesOut.multipliedBy(reservesIn).dividedBy(calc);
        amountOut = reservesOut.minus(calc);
        // console.log('B: ' + amountOut);
    }
    var reservesInAfter = reservesIn.plus(amountIn);
    var reservesOutAfter = reservesOut.minus(amountOut);
    var result = { amountOut: amountOut, reservesInAfter: reservesInAfter, reservesOutAfter: reservesOutAfter };
    // console.log(result);
    /*
    {
      amountOut: BigNumber { s: 1, e: 2, c: [ 136, 34879952338476, 34780100000000 ] },
      reservesInAfter: BigNumber { s: 1, e: 3, c: [ 7777, 30722331447761, 19400000000000 ] },
      reservesOutAfter: BigNumber {
        s: 1,
        e: 4,
        c: [ 54703, 63070145828023, 19029200000000 ]
      }
    }
    */
    return result;
}
function getAmountIn(amountOut, reservesIn, reservesOut) {
    var amountIn = new bignumber_js_1.default(0);
    if (!amountOut.eq(0)) {
        if (amountOut.isGreaterThanOrEqualTo(reservesOut)) {
            amountIn = new bignumber_js_1.default(Infinity);
        }
        else {
            // amountIn = reservesIn
            //   .multipliedBy(reservesOut)
            //   .dividedBy(reservesOut.minus(amountOut)) // reserves in after
            //   .minus(reservesIn) // minus reserves in
            //   .dividedBy(0.997) // fee
            // console.log('A: ' + amountIn);
            var calc = reservesIn.multipliedBy(reservesOut);
            calc = calc.dividedBy(reservesOut.minus(amountOut)); // Reserves in after
            calc = calc.minus(reservesIn); // Minus the reserves in
            amountIn = calc.dividedBy(0.997); // Divide the fee
            // console.log('B: ' + amountIn);
        }
    }
    var reservesInAfter = reservesIn.plus(amountIn);
    var reservesOutAfter = reservesOut.minus(amountOut);
    var result = { amountIn: amountIn, reservesInAfter: reservesInAfter, reservesOutAfter: reservesOutAfter };
    // console.log(result);
    /*
    {
      amountIn: BigNumber {
        s: 1,
        e: 7,
        c: [ 11029932, 87882955692193, 33023000000000 ]
      },
      reservesInAfter: BigNumber {
        s: 1,
        e: 7,
        c: [ 22026775, 95902262517294, 75399900000000 ]
      },
      reservesOutAfter: BigNumber { s: 1, e: 1, c: [ 19, 37267778402985, 7460000000000 ] }
    }
    */
    return result;
}
function computeBidsAsks(baseReserves, quoteReserves, numSegments) {
    if (numSegments === void 0) { numSegments = 200; }
    // Return empty bids and asks if there are no reserves
    if (baseReserves.eq(0) || quoteReserves.eq(0)) {
        return {
            bids: [],
            asks: []
        };
    }
    // we don't do exactly 100 segments because we do not care about the trade that takes exact out of entire reserves
    var increment = baseReserves.dividedBy(numSegments + 1);
    console.log("C BID/ASKS: Increment " + increment);
    var baseAmounts = Array.from({ length: numSegments }, function (x, i) {
        return increment.multipliedBy(i);
    });
    console.log(baseAmounts);
    // Calculates the bids
    var bids = baseAmounts.map(function (buyBaseAmount) {
        var _a = getAmountOut(buyBaseAmount, baseReserves, quoteReserves), baseReservesBefore = _a.reservesInAfter, quoteReservesBefore = _a.reservesOutAfter;
        var amountOut = getAmountOut(increment, baseReservesBefore, quoteReservesBefore).amountOut;
        return [
            increment.toString(),
            amountOut.dividedBy(increment).toString()
        ];
    });
    // Calculates the asks
    var asks = baseAmounts.map(function (sellBaseAmount) {
        var _a = getAmountIn(sellBaseAmount, quoteReserves, baseReserves), baseReservesBefore = _a.reservesInAfter, quoteReservesBefore = _a.reservesOutAfter;
        var amountIn = getAmountIn(increment, baseReservesBefore, quoteReservesBefore).amountIn;
        return [
            increment.toString(),
            amountIn.dividedBy(increment).toString()
        ];
    });
    return { bids: bids, asks: asks };
}
exports.computeBidsAsks = computeBidsAsks;
