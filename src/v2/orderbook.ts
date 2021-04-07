import { getAddress } from '@ethersproject/address';
import { APIGatewayProxyHandler } from 'aws-lambda';
import BigNumber from 'bignumber.js';
import {
  createSuccessResponse,
  createBadRequestResponse,
  createServerErrorResponse,
} from '../utils/response';

import { getReserves } from './_shared';
import { computeBidsAsks } from '../utils/computeBidsAsks';

export const handler: APIGatewayProxyHandler = async (event) => {
  // Validate that the pair given is valid
  if (
    !event.pathParameters?.pair ||
    !/^0x[0-9a-fA-F]{40}_0x[0-9a-fA-F]{40}$/.test(event.pathParameters.pair)
  ) {
    return createBadRequestResponse(
      'Invalid pair identifier: must be of format tokenAddress_tokenAddress',
    );
  }

  const [tokenA, tokenB] = event.pathParameters?.pair.split('_');
  let idA: string, idB: string;
  try {
    [idA, idB] = [getAddress(tokenA), getAddress(tokenB)];
  } catch (error) {
    return createBadRequestResponse(
      'Invalid pair identifier: both addresses must be *checksummed*',
    );
  }

  try {
    // Get the reserves for tokenA and tokenB
    const [reservesA, reservesB] = await getReserves(idA, idB);

    // Should this be epoch?
    const timestamp = new Date().getTime();
    let reponseBody = {
      timestamp,
      tokenA, // NOTE: Added by Carlos
      tokenB, // NOTE: Added by Carlos
      ...computeBidsAsks(new BigNumber(reservesA), new BigNumber(reservesB)),
    };

    return createSuccessResponse(reponseBody);
  } catch (error) {
    return createServerErrorResponse(error);
  }
};
