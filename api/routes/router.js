const express = require('express');
const router = express.Router();
const path = require('path');

// Augur node instance
const Augur = require('../augur');
let augur = Augur.node;

// Connect to Augur node
augur.connect({
  ethereumNode: {
    httpAddresses: [
      //"https://rinkeby.infura.io" // hosted HTTP address for Ethereum Rinkeby test network
      "https://mainnet.infura.io"
    ],
    wsAddresses: [
      //"wss://rinkeby.infura.io/ws" // hosted WebSocket address Ethereum Rinkeby test network
      "wss://mainnet.infura.io/ws"
    ]
  },
  //augurNode: "wss://dev.augur.net/augur-node" // WebSocket address for an Augur Node on Rinkeby
  augurNode: "wss://eth-mainnet.alchemyapi.io/jsonrpc/-vPGIFwUyjlMRF9beTLXiGQUK6Nf3k8z"
}, (error, connectionInfo) => {
  console.log(connectionInfo);
});

/**
 * Get All COI Owned Markets from Augur
 * @type GET
 * @url GET: /markets/owned
 */
router.get('/markets/owned', (request, response) => {
  // Ensure valid JSON header
  response.header('Content-Type', 'application/json');

  // Response data placeholder
  let res;

  //console.log(connectionInfo);
  console.log('Augur connected');

  // Connected to node, now fetch market ID's
  augur.markets.getMarkets({
    universe: process.env.AUGUR_UNIVERSE,
    creator: process.env.COI_OWNER_ADDRESS
  }, (error, markets) => {
    // No markets response
    if (!markets.length) {
      // Formulate response object
      res = {
        data: {
            markets: []
        }
      };
      // Send empty data response
      response.send(JSON.stringify(res));
    } else {
      console.log('Fetching market details for =>', markets);
      // Let's get some markets shall we?
      augur.markets.getMarketsInfo({
          marketIds: markets
      }, (error, marketData) => {
          //console.log('Markets with meta details =>', marketData);
          // Formulate response object
          res = {
            data: {
              markets: marketData
            }
          };
          // Return owned markets response
          response.send(JSON.stringify(res));
      });
    }
  });

});

/**
 * Get All COI Owned Markets from Augur
 * @type GET
 * @url GET: /markets/community
 */
router.get('/markets/community', (request, response) => {
    // Ensure valid JSON header
  response.header('Content-Type', 'application/json');

  // Response data placeholder
  let res;

  // Connected to node, now fetch market ID's
  augur.markets.getMarkets({
    universe: process.env.AUGUR_UNIVERSE,
    search: "tags: CheezeWizards, Coinlist"
  }, (error, markets) => {
    // No markets response
    if (!markets.length) {
      // Formulate response object
      res = {
        data: {
            markets: []
        }
      };
      // Send empty data response
      response.send(JSON.stringify(res));
    } else {
      console.log('Fetching market details for =>', markets);
      // Let's get some markets shall we?
      augur.markets.getMarketsInfo({
          marketIds: markets
      }, (error, marketData) => {
          let marketsFiltered = marketData.filter((market) => {
              //console.log(market);
              if (market.author.toLowerCase() !== process.env.COI_OWNER_ADDRESS.toLowerCase()) {
                  return market;
              }
          });

          //console.log('Markets with meta details =>', marketData);
          // Formulate response object
          res = {
            data: {
              markets: marketsFiltered
            }
          };
          // Return owned markets response
          response.send(JSON.stringify(res));
      });
    }
  });
});

/*
EXAMPLE
// Send error response
errMsg = toErrorMsg(errMsg);
console.log([errType, errMsg]);
response.send(errMsg);
 */

// EXTERNAL / UTILITY FUNCTIONS

toErrorMsg = function (errMsg) {
  let _errMsg = errMsg.split(':');
  let HTTP_Response = {
    error: _errMsg[1].trim()
  };

  return JSON.stringify(HTTP_Response);
};

module.exports = router;