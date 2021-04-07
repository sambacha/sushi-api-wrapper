import BigNumber from 'bignumber.js';
import BLACKLIST from '../constants/blacklist';

import client from './apollo/client';
import {
  PAIR_RESERVES_BY_TOKENS,
  SWAPS_BY_PAIR,
  TOP_PAIRS,
  PAIR_FROM_TOKENS,
  PAIRS_VOLUME_QUERY,
} from './apollo/queries';
import { getBlockFromTimestamp } from './blocks/queries';
import {
  PairReservesQuery,
  PairReservesQueryVariables,
  PairsVolumeQuery,
  PairsVolumeQueryVariables,
  SwapsByPairQuery,
  SwapsByPairQueryVariables,
  TopPairsQuery,
  TopPairsQueryVariables,
} from './generated/v2-subgraph';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function get24HoursAgo(): number {
  return Math.floor((Date.now() - DAY) / 1000);
}

export type Pair = TopPairsQuery['pairs'][number];

export interface MappedDetailedPair extends Pair {
  price?: string;
  previous24hVolumeToken0: BigNumber;
  previous24hVolumeToken1: BigNumber;
}

export async function getTopPairs(
  limit: number = 10,
): Promise<MappedDetailedPair[]> {
  // Get the current time in epoch
  const epochSecond = Math.floor(new Date().getTime() / SECOND);
  console.log('EPOCH: ' + epochSecond);

  // Get the first block for the query
  const firstBlock = await getBlockFromTimestamp(epochSecond - DAY);
  console.log('FIRST BLOCK: ' + firstBlock);
  if (!firstBlock) throw new Error('first block was not fetched');

  // Fetching the top pairs
  const {
    data: { pairs },
    errors: topPairsErrors,
  } = await client.query<TopPairsQuery, TopPairsQueryVariables>({
    query: TOP_PAIRS,
    variables: {
      limit: limit,
      excludeTokenIds: BLACKLIST,
    },
    fetchPolicy: 'no-cache',
  });
  if (topPairsErrors && topPairsErrors.length > 0)
    throw new Error('Failed to fetch top pairs from the subgraph');
  // console.log(pairs);
  /*
      __typename: 'Pair',
    id: '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974',
    reserve0: '1516278.495792741645192258',
    reserve1: '26695.012625889882170866',
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
    volumeToken0: '110343138.67051774156163507',
    volumeToken1: '2681864.257250288138901688'
  }
  */

  // Pairs Volume Query with the block above
  const {
    data: { pairVolumes },
    errors: yesterdayVolumeErrors,
  } = await client.query<PairsVolumeQuery, PairsVolumeQueryVariables>({
    query: PAIRS_VOLUME_QUERY,
    variables: {
      limit: limit,
      pairIds: pairs.map((pair) => pair.id),
      blockNumber: +firstBlock,
    },
    fetchPolicy: 'no-cache',
  });
  if (yesterdayVolumeErrors && yesterdayVolumeErrors.length > 0)
    throw new Error(`Failed to get volume info for 24h ago from the subgraph`);
  // console.log(pairVolumes);
  /*
    {
    __typename: 'Pair',
    id: '0xf52f433b79d21023af94251958bed3b64a2b7930',
    volumeToken0: '5946156.539511',
    volumeToken1: '762026.114541'
  }
  */

  // Get yesterday volume index
  const yesterdayVolumeIndex =
    pairVolumes?.reduce<{
      [pairId: string]: {
        volumeToken0: BigNumber;
        volumeToken1: BigNumber;
      };
    }>((memo, pair) => {
      memo[pair.id] = {
        volumeToken0: new BigNumber(pair.volumeToken0),
        volumeToken1: new BigNumber(pair.volumeToken1),
      };
      return memo;
    }, {}) ?? {};
  // console.log(yesterdayVolumeIndex);
  /*
  '0xf52f433b79d21023af94251958bed3b64a2b7930': {
    volumeToken0: BigNumber { s: 1, e: 6, c: [Array] },
    volumeToken1: BigNumber { s: 1, e: 5, c: [Array] }
  }
  */

  let result =
    pairs?.map(
      (pair): MappedDetailedPair => {
        const yesterday = yesterdayVolumeIndex[pair.id];

        // Check if pair has yesterday volume
        if (yesterday) {
          if (yesterday.volumeToken0.gt(pair.volumeToken0)) {
            throw new Error(
              `Invalid subgraph response: pair ${pair.id} returned volumeToken0 < yesterday.volumeToken0`,
            );
          }
          if (yesterday.volumeToken1.gt(pair.volumeToken1)) {
            throw new Error(
              `Invalid subgraph response: pair ${pair.id} returned volumeToken1 < yesterday.volumeToken1`,
            );
          }
        }

        return {
          ...pair,
          price:
            pair.reserve0 !== '0' && pair.reserve1 !== '0'
              ? new BigNumber(pair.reserve1).dividedBy(pair.reserve0).toString()
              : undefined,
          previous24hVolumeToken0:
            pair.volumeToken0 && yesterday?.volumeToken0
              ? new BigNumber(pair.volumeToken0).minus(yesterday.volumeToken0)
              : new BigNumber(pair.volumeToken0),
          previous24hVolumeToken1:
            pair.volumeToken1 && yesterday?.volumeToken1
              ? new BigNumber(pair.volumeToken1).minus(yesterday.volumeToken1)
              : new BigNumber(pair.volumeToken1),
        };
      },
    ) ?? [];
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

  return result;
}

function isSorted(tokenA: string, tokenB: string): boolean {
  return tokenA.toLowerCase() < tokenB.toLowerCase();
}

function sortedFormatted(tokenA: string, tokenB: string): [string, string] {
  return isSorted(tokenA, tokenB)
    ? [tokenA.toLowerCase(), tokenB.toLowerCase()]
    : [tokenB.toLowerCase(), tokenA.toLowerCase()];
}

// returns reserves of token a and b in the order they are queried
export async function getReserves(
  tokenA: string,
  tokenB: string,
): Promise<[string, string]> {
  const [token0, token1] = sortedFormatted(tokenA, tokenB);

  return client
    .query<PairReservesQuery, PairReservesQueryVariables>({
      query: PAIR_RESERVES_BY_TOKENS,
      variables: {
        token0,
        token1,
      },
    })
    .then(
      ({
        data: {
          pairs: [{ reserve0, reserve1 }],
        },
      }): [string, string] => {
        if (tokenA.toLowerCase() === token0) {
          return [reserve0, reserve1];
        }
        return [reserve1, reserve0];
      },
    );
}

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

type Swap = ArrayElement<SwapsByPairQuery['swaps']>;

interface SwapMapped extends Swap {
  amountAIn: string;
  amountAOut: string;
  amountBIn: string;
  amountBOut: string;
}

// Gets the swaps (aka trades) done on tokenA x tokenB
export async function getSwaps(
  tokenA: string,
  tokenB: string,
): Promise<SwapMapped[]> {
  const _24HoursAgo = Math.floor((Date.now() - DAY) / SECOND);
  const [token0, token1] = sortedFormatted(tokenA, tokenB);

  let {
    data: {
      pairs: [{ id: pairAddress }],
    },
  } = await client.query({
    query: PAIR_FROM_TOKENS,
    variables: { token0, token1 },
  });

  const sorted = isSorted(tokenA, tokenB);

  let skip = 0;
  let results: SwapMapped[] = [];
  let finished = false;

  while (!finished) {
    await client
      .query<SwapsByPairQuery, SwapsByPairQueryVariables>({
        query: SWAPS_BY_PAIR,
        variables: { skip, pairAddress, timestamp: _24HoursAgo },
      })
      .then(({ data: { swaps } }): void => {
        if (!swaps || swaps.length === 0) {
          // No more swaps found for last 24 hours - end the query
          finished = true;
        } else {
          // If not finished fetch the next set
          skip += swaps.length;
          results = results.concat(
            swaps.map(
              (swap: Swap): SwapMapped => ({
                ...swap,
                amountAIn: sorted ? swap.amount0In : swap.amount1In,
                amountAOut: sorted ? swap.amount0Out : swap.amount1Out,
                amountBIn: sorted ? swap.amount1In : swap.amount0In,
                amountBOut: sorted ? swap.amount1Out : swap.amount0Out,
              }),
            ),
          );
        }
      });
  }

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

  return results;
}
