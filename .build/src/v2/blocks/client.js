"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockClient = void 0;
var apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
var apollo_client_1 = require("apollo-client");
var apollo_link_http_1 = require("apollo-link-http");
var node_fetch_1 = __importDefault(require("node-fetch"));
exports.blockClient = new apollo_client_1.ApolloClient({
    link: new apollo_link_http_1.HttpLink({
        fetch: node_fetch_1.default,
        uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks'
    }),
    cache: new apollo_cache_inmemory_1.InMemoryCache()
});
