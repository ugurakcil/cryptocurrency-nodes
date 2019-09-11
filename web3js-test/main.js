const Web3 = require('web3')

const web3 = new Web3(Web3. givenProvider || 'ws://localhost:8546')

var sync = web3.eth.syncing;
console.log('syncing : ', sync);

web3.eth.call({
    to: "0xD943e08f428A122e7008E05B0892a1abcD3c96a2"
})


/*
var abi = [
    {
      "constant": true,
      "inputs": [],
      "name": "",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "inputs": [],
      "payable": false,
      "type": "constructor"
    }
  ];

var contract = new web3.eth.Contract(abi, '0xD943e08f428A122e7008E05B0892a1abcD3c96a2');

contract.getPastEvents(
    "Transfer",
    {
      filter: {from:'0xD943e08f428A122e7008E05B0892a1abcD3c96a2'},
      fromBlock: 0,
      toBlock: 'latest'
    }
);
*/



/*
contract.events.Evt({}, function (err, evt) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(evt)
});

// this will grab all events from the past
contract.getPastEvents('Evt', {fromBlock: 0, toBlock: 'latest'},
  function (err, arg) {
    if(err) {
        console.error(err);
        return;
    }
    console.log(arg)
});
*/


/*
[{
    "type":"function",
    "name":"foo",
    "inputs": [{"name":"a","type":"uint256"}],
    "outputs": [{"name":"b","type":"address"}]
},{
    "type":"event",
    "name":"Event",
    "inputs": [{"name":"a","type":"uint256","indexed":true},{"name":"b","type":"bytes32","indexed":false}],
}]
*/

// contract abi
/*

const abi = [{
    "type":"function",
    "name":"foo",
    "inputs": [{"name":"a","type":"uint256"}],
    "outputs": [{"name":"b","type":"address"}]
},{
    "type":"event",
    "name":"Event",
    "inputs": [{"name":"a","type":"uint256","indexed":true},{"name":"b","type":"bytes32","indexed":false}],
}]
*/

/*
const abi = [{
    name: 'myConstantMethod',
    type: 'function',
    constant: true,
    inputs: [{ name: 'a', type: 'string' }],
    outputs: [{name: 'd', type: 'string' }]
}, {
    name: 'myStateChangingMethod',
    type: 'function',
    constant: false,
    inputs: [{ name: 'a', type: 'string' }, { name: 'b', type: 'int' }],
    outputs: []
}, {
    name: 'myEvent',
    type: 'event',
    inputs: [{name: 'a', type: 'int', indexed: true},{name: 'b', type: 'bool', indexed: false}]
}];

// creation of contract object
var MyContract = new web3.eth.Contract(abi, '0xD943e08f428A122e7008E05B0892a1abcD3c96a2', {
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
});

MyContract.getPastEvents('MyEvent', {
    filter: {myIndexedParam: [20,23]}, // Using an array means OR: e.g. 20 or 23
    fromBlock: 0,
    toBlock: 'latest'
}, function(error, events){ console.log(events); }).then(function(events){
    console.log(events) // same results as the optional callback above
});
*/

/*
// initiate contract for an address
var myContractInstance = MyContract.at('0xD943e08f428A122e7008E05B0892a1abcD3c96a2');
// call constant function
var result = myContractInstance.myConstantMethod('myParam');
console.log(result) // '0x25434534534'
// send a transaction to a function
myContractInstance.myStateChangingMethod('someParam1', 23, {value: 200, gas: 2000});
// short hand style
//web3.eth.contract(abi).at(address).myAwesomeMethod(...);
// create filter
var filter = myContractInstance.myEvent({a: 5}, function (error, result) {
 if (!error)
   console.log(result);
});
*/


/*
var filter = web3.eth.filter({toBlock:'pending'});
filter.watch(function (error, log) {
 console.log(log); //  {"address":"0x0000000000000000000000000000000000000000", "data":"0x0000000000000000000000000000000000000000000000000000000000000000", ...}
});
*/

/*
// get all past logs again.
var myResults = filter.get(function(error, logs){ ... });
...
// stops and uninstalls the filter
filter.stopWatching();

*/

/*
console.log(web3.currentProvider)
*/

/*
var defaultAccount = web3.eth.defaultAccount;
console.log(defaultAccount); // ''
*/

/*
web3.eth.getAccounts((error, result) => {
  console.log(result)
})
*/

/*
getAccountTransactions('0xD943e08f428A122e7008E05B0892a1abcD3c96a2')

function getAccountTransactions(accAddress, startBlockNumber, endBlockNumber) {
  console.log("Searching for transactions to/from account \"" + accAddress + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    var block = eth.getBlock(i, true);

    if (block != null && block.transactions != null) {
      block.transactions.forEach( function(e) {
        if (accAddress == "*" || accAddress == e.from || accAddress == e.to) {
          console.log("  tx hash          : " + e.hash + "\n"
            + "   nonce           : " + e.nonce + "\n"
            + "   blockHash       : " + e.blockHash + "\n"
            + "   blockNumber     : " + e.blockNumber + "\n"
            + "   transactionIndex: " + e.transactionIndex + "\n"
            + "   from            : " + e.from + "\n"
            + "   to              : " + e.to + "\n"
            + "   value           : " + e.value + "\n"
            + "   gasPrice        : " + e.gasPrice + "\n"
            + "   gas             : " + e.gas + "\n"
            + "   input           : " + e.input);
        }
      })
    }
  }
}
*/

/*
web3.eth.subscribe('logs', {
  address: '0xD943e08f428A122e7008E05B0892a1abcD3c96a2'
}, function(error, result){
    if (!error)
      console.log('from-result: ',result);
}).on("data", function(transaction){
    console.log('from-data: ',transaction);
}).on("changed", function(transaction){
    console.log('from-changed: ',transaction);
});
*/

/*
web3.eth.getTransactionCount("0x6242918E855c9723e6d337c8b7235E980728C883").then(console.log)
*/

/*
web3.eth.getPastLogs({fromBlock:'0x0',address:'0x6242918E855c9723e6d337c8b7235E980728C883'}).then(res => {
  res.forEach(rec => {
    console.log(rec.blockNumber, rec.transactionHash, rec.topics);
  });
}).catch(err => console.log("getPastLogs failed", err));
*/


/*
var myAddr = '0x7A3a257F6843AB6098FD30826e452845F045E933';
var currentBlock = eth.blockNumber;
var n = eth.getTransactionCount(myAddr, currentBlock);
var bal = eth.getBalance(myAddr, currentBlock);
for (var i=currentBlock; i >= 0 && (n > 0 || bal > 0); --i) {
    try {
        var block = eth.getBlock(i, true);
        if (block && block.transactions) {
            block.transactions.forEach(function(e) {
                if (myAddr == e.from) {
                    if (e.from != e.to)
                        bal = bal.plus(e.value);
                    console.log(i, e.from, e.to, e.value.toString(10));
                    --n;
                }
                if (myAddr == e.to) {
                    if (e.from != e.to)
                        bal = bal.minus(e.value);
                    console.log(i, e.from, e.to, e.value.toString(10));
                }
            });
        }
    } catch (e) { console.error("Error in block " + i, e); }
}
*/

/*
web3.eth.subscribe('logs', {
  address: '0xD943e08f428A122e7008E05B0892a1abcD3c96a2'
}, function(error, result){
    if (!error)
      console.log('from-result: ',result);
}).on("data", function(transaction){
    console.log('from-data: ',transaction);
}).on("changed", function(transaction){
    console.log('from-changed: ',transaction);
});
*/

/*
web3.eth.subscribe('syncing', function(error, result){
    if (!error)
      console.log('result: ',result);
}).on("data", function(transaction){
    console.log('data: ',transaction);
}).on("changed", function(transaction){
    console.log('changed: ',transaction);
});
*/

/*
web3.eth.isSyncing().then(console.log);
console.log(web3.eth.accounts)
*/

/*
web3.eth.getAccounts().then(e => console.log(e) );
*/

/*
const account = web3.eth.accounts.create();
console.log(account)
*/

/*
const subscription = web3.eth.subscribe('pendingTransactions', function(error, result){
    if (!error)
      console.log(result);
}).on("data", function(transaction){
    console.log(transaction);
});
*/

/*

web3.eth.isSyncing().then(function (r)
{
  console.log("r" + JSON.stringify(r) );
  console.log("currentBlock: " + r['currentBlock']);
  console.log("highestBlock: " + r['highestBlock']);
});


*/

/*

const my_test_address = "0x6242918E855c9723e6d337c8b7235E980728C883";
  web3.eth.getBalance(my_test_address, 'latest',
    function (err, res){
      if(err)
        console.log(err);

      console.log(res)
    }
)

*/
