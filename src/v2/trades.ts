import { getAddress } from '@ethersproject/address'
import { APIGatewayProxyHandler } from 'aws-lambda'
import BigNumber from 'bignumber.js'

import { getSwaps } from './_shared'
import { createSuccessResponse, createBadRequestResponse, createServerErrorResponse } from '../utils/response'

export const handler: APIGatewayProxyHandler = async event =>
{
  // Validate the pair tokenA_tokenB given
  if (!event.pathParameters?.pair || !/^0x[0-9a-fA-F]{40}_0x[0-9a-fA-F]{40}$/.test(event.pathParameters.pair))
  {
    return createBadRequestResponse('Invalid pair identifier: must be of format tokenAddress_tokenAddress');
  }

  // Split the pair into two tokens
  const [tokenA, tokenB] = event.pathParameters.pair.split('_');

  let idA: string, idB: string;

  try
  {
    // Validate correct ethereum addresses
    ;[idA, idB] = [
      getAddress(tokenA),
      getAddress(tokenB)
    ];
  }
  catch (error)
  {
    return createBadRequestResponse('Invalid pair identifier: both asset identifiers must be *checksummed* addresses')
  }

  try
  {
    const swaps = await getSwaps(idA, idB);
    // console.log(swaps);
    /*
      {
      id: '0x3bb550d3d857023cd8f11058fac8824dbcc403e43723704ff376cafe75046982-0',
      timestamp: '1613491232',
      amount0In: '0',
      amount0Out: '1.76',
      amount1In: '48.556058665031201173',
      amount1Out: '0',
      __typename: 'Swap',
      amountAIn: '0',
      amountAOut: '1.76',
      amountBIn: '48.556058665031201173',
      amountBOut: '0'
    },
    */

    let responseBody = swaps.map(swap => {
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
      const aIn = swap.amountAIn !== '0';
      const aOut = swap.amountAOut !== '0';

      const bIn = swap.amountBIn !== '0';
      const bOut = swap.amountBOut !== '0';

      // Token A is the base - if the pair sends A and not B then it's a "BUY"

      // BUY = Token A OUT && Token B IN
      const isBuy = aOut && bIn && !aIn && !bOut;

      // SELL = Token A IN && Token B OUT
      const isSell = !aOut && !bIn && aIn && bOut;

      // BORROW = Token A IN+OUT && Token B IN+OUT
      const isBorrowBoth = aOut && bOut && aIn && bIn;

      // For trades there's either a BUY, SELL, BORROW-BOTH or UNKNOWN
      const type = isBuy ? 'buy' : isSell ? 'sell' : isBorrowBoth ? 'borrow-both' : '???';

      // Figure the base and quote amount
      const baseAmount = aOut ? swap.amountAOut : swap.amountAIn;
      const quoteAmount = bOut ? swap.amountBOut : swap.amountBIn;

      let price;

      // price = baseAmount !== '0' ? new BigNumber(quoteAmount).dividedBy(new BigNumber(baseAmount)).toString() : undefined;
      // console.log('A: ' + price);

      let calc = undefined;
      if (baseAmount !== '0')
      {
        calc = new BigNumber(quoteAmount);
        price = calc.dividedBy(new BigNumber(baseAmount)).toString();
      }
      // console.log('B: ' + price);

      return {
        trade_id: swap.id,
        base_volume: baseAmount,
        quote_volume: quoteAmount,
        type,
        trade_timestamp: swap.timestamp,
        price
      }
    });

    return createSuccessResponse(responseBody);
  }
  catch (error)
  {
    return createServerErrorResponse(error);
  }
}
