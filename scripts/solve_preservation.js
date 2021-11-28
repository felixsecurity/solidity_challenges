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
    console.log("---------------------------------------")
}

async function main() {
  let tx
  const accounts = await hre.ethers.getSigners();

  const [TimeLibrary, tl1] = await niceDeploy("TimeLibraryContract");
  const [_, tl2] = await niceDeploy("TimeLibraryContract");
  const [Preservation, proxy] = await niceDeploy("Preservation", tl1.address, tl2.address);

  console.log("Owner: ", await proxy.owner())
  await getSlots(proxy, [0,1,2,3])

  const [Master, mt] = await niceDeploy("MasterOfTime")

  tx = await proxy.connect(accounts[1]).setFirstTime(mt.address);
  await tx.wait()

  await getSlots(proxy, [0,1,2,3])

  tx = await proxy.connect(accounts[1]).setFirstTime(accounts[1].address);
  await tx.wait()

  await getSlots(proxy, [0,1,2,3])

  console.log("Owner: ", await proxy.owner())

}







/*

  const [MasterOfTime, mt] = await niceDeploy("MasterOfTime")
  tx = await proxy.connect(accounts[1]).setFirstTime(mt.address)
  await tx.wait()
  await getSlots(proxy, [0,1,2,3])
  tx = await proxy.connect(accounts[1]).setFirstTime(accounts[1].address)
  await tx.wait()
  await getSlots(proxy, [0,1,2,3])
  console.log("Owner: ", await proxy.owner())

 


}
 */

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
