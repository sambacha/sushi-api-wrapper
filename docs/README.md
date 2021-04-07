# SushiSwap API

[![dependency - sushiswap-api](https://img.shields.io/badge/sls-sushiswap--api-blue?logo=serverless&logoColor=white)](https://www.npmjs.com/package/sushiswap-api) [![dependency - sushilayer](https://img.shields.io/badge/nestjs-sushilayer-blue?logo=nestjs&logoColor=white)](https://www.npmjs.com/package/sushilayer) [![GitHub release](https://img.shields.io/github/release/sambacha/sushi-api-wrapper?include_prereleases=&sort=semver)](https://github.com/sambacha/sushi-api-wrapper/releases/) [![Status](https://img.shields.io/badge/service-mainnet-status)](#)



The SushiLayer API is a set of **authenticated** endpoints used by market aggregators (e.g. coinmarketcap.com) to surface 
SushiSwap liquidity and volume information. All information is fetched from the underlying subgraphs.

Prefer the Uniswap subgraph for any Uniswap queries whenever possible. The respective subgraphs will always have more
recent data.

## V2 Documentation

The documentation of the `/v2/` endpoints is [here](./v2.md).

## Deploying the API

The API uses the [serverless framework](https://serverless.com) and can easily be deployed to any AWS account,
via the `yarn sls deploy` command.

In order to configure your AWS account as a target, 
see [the serverless docs](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).
