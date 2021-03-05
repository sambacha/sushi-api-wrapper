import BigNumber from 'bignumber.js'

function getAmountOut(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber): {
  amountOut: BigNumber;
  reservesInAfter: BigNumber;
  reservesOutAfter: BigNumber
} {

  let amountOut = new BigNumber(0);
  if (!amountIn.eq(0))
  {
    // amountOut = reservesOut.minus(
    //     reservesOut.multipliedBy(reservesIn).dividedBy(
    //       reservesIn.plus(amountIn.multipliedBy(0.997))
    //   )
    // );
    // console.log('A: ' + amountOut);

    let calc = amountIn.multipliedBy(0.997); // Multiply the fee
    calc = reservesIn.plus(calc);
    calc = reservesOut.multipliedBy(reservesIn).dividedBy(calc);

    amountOut = reservesOut.minus(calc);
    // console.log('B: ' + amountOut);
  }

  let reservesInAfter = reservesIn.plus(amountIn);
  let reservesOutAfter = reservesOut.minus(amountOut);

  let result = { amountOut, reservesInAfter, reservesOutAfter };
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

function getAmountIn(amountOut: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber): {
  amountIn: BigNumber;
  reservesInAfter: BigNumber;
  reservesOutAfter: BigNumber
} {

  let amountIn = new BigNumber(0);
  if (!amountOut.eq(0))
  {
    if (amountOut.isGreaterThanOrEqualTo(reservesOut))
    {
      amountIn = new BigNumber(Infinity);
    }
    else
    {
      // amountIn = reservesIn
      //   .multipliedBy(reservesOut)
      //   .dividedBy(reservesOut.minus(amountOut)) // reserves in after
      //   .minus(reservesIn) // minus reserves in
      //   .dividedBy(0.997) // fee
      // console.log('A: ' + amountIn);

      let calc = reservesIn.multipliedBy(reservesOut);
      calc = calc.dividedBy(reservesOut.minus(amountOut)); // Reserves in after
      calc = calc.minus(reservesIn); // Minus the reserves in
      amountIn = calc.dividedBy(0.997); // Divide the fee
      // console.log('B: ' + amountIn);
    }
  }

  let reservesInAfter = reservesIn.plus(amountIn);
  let reservesOutAfter = reservesOut.minus(amountOut);

  let result = { amountIn, reservesInAfter, reservesOutAfter };
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

export function computeBidsAsks(baseReserves: BigNumber, quoteReserves: BigNumber, numSegments: number = 200): {
  bids: [string, string][];
  asks: [string, string][]
} {
  // Return empty bids and asks if there are no reserves
  if (baseReserves.eq(0) || quoteReserves.eq(0)) {
    return {
      bids: [],
      asks: []
    }
  }

  // we don't do exactly 100 segments because we do not care about the trade that takes exact out of entire reserves
  const increment = baseReserves.dividedBy(numSegments + 1)
  console.log(`C BID/ASKS: Increment ${increment}`);
  const baseAmounts = Array.from({ length: numSegments }, (x, i): BigNumber => {
    return increment.multipliedBy(i);
  });
  console.log(baseAmounts);

  // Calculates the bids
  const bids = baseAmounts.map((buyBaseAmount): [string, string] => {
    const {
      reservesInAfter: baseReservesBefore,
      reservesOutAfter: quoteReservesBefore
    } = getAmountOut(buyBaseAmount, baseReserves, quoteReserves);

    const { amountOut } = getAmountOut(increment, baseReservesBefore, quoteReservesBefore);

    return [
      increment.toString(),
      amountOut.dividedBy(increment).toString()
    ];
  });

  // Calculates the asks
  const asks = baseAmounts.map((sellBaseAmount): [string, string] => {
    const {
      reservesInAfter: baseReservesBefore,
      reservesOutAfter: quoteReservesBefore
    } = getAmountIn(sellBaseAmount, quoteReserves, baseReserves);

    const { amountIn } = getAmountIn(increment, baseReservesBefore, quoteReservesBefore);

    return [
      increment.toString(),
      amountIn.dividedBy(increment).toString()
    ]
  });

  return { bids, asks }
}
