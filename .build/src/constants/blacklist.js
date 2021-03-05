"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// list of lowercase token addresses that are not returned from the API
var BLACKLIST = [
    '0xb8c77482e45f1f44de1745f52c74426c631bdd52',
    '0x95daaab98046846bf4b2853e23cba236fa394a31',
    '0x55296f69f40ea6d20e478533c15a6b08b654e758',
    '0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea',
    '0x5c406d99e04b8494dc253fcc52943ef82bca7d75',
    '0x5a4ade4f3e934a0885f42884f7077261c3f4f66f',
    '0x42456d7084eacf4083f1140d3229471bba2949a8' // old sETH
];
exports.default = BLACKLIST;
