'use strict';

const evmWeb3Hook = require('..');
const assert = require('assert').strict;

assert.strictEqual(evmWeb3Hook(), 'Hello from evmWeb3Hook');
console.info('evmWeb3Hook tests passed');
