pragma solidity ^0.4.17;
contract CommitReveal {
	// sencom =0, revcom = 1, minercom = 2
	address user1;
	address user2;
	bytes32 hash1;
	bytes32 hash2;
	int committed1;
	int committed2;
// Check if required minimum amount is present
	modifier checkbalance() {
		require(msg.value>=5000000000000000000);
		_;
	}
	// Check if user is already registered
	modifier isRegistered() {
		require(msg.sender==user1 || msg.sender==user2);
		_;
	}
	// Check if user is already registered
	modifier isNotRegistered() {
		require(msg.sender!=user1 && msg.sender!=user2);
		_;
	}
	// Check if both users have committed their choices, so the dapp can go to reveal stage
	modifier initialCommit(){
		require( hash1!=0 && hash2!=0);
		_;
	}
	// Check if both users have committed their choices, so the dapp can go to reveal stage
	modifier bothCommitted(){
		require((committed1!=0 && committed2!=0)
		_;
	}
	// Check if string is valid
	modifier validChoice(string choice){
		require(keccak256(choice) == keccak256("sencom") || keccak256(choice) == keccak256("reccom") || keccak256(choice) == keccak256("mincom"));
		_;
	}


	function initalCommit() public payable isNotRegistered checkbalance{
		if(user1==0){
			user1 = msg.sender;
		}
		else {
			if(user2==0)
				user2 = msg.sender;
		}
	}
	function Commit(string choice,string randStr) public isRegistered validChoice(choice) returns (bool) {
		if(msg.sender ==user1 && hash1==bytes32(0)){
			hash1 = keccak256(keccak256(choice) ^ keccak256(randStr));
			return true;
		}
		if(msg.receiver ==user2 && hash2==bytes32(0)){
			hash2 = keccak256(keccak256(choice) ^ keccak256(randStr));
			return true;
		}
		return false;
	}
	function reveal(string choice,string randStr) public isRegistered bothCommitted validChoice(choice) returns (bool) {
		bytes32 tempHash = keccak256(keccak256(choice) ^ keccak256(randStr));
		if(msg.sender ==user1){
			if(tempHash==hash1){
				if(keccak256(choice)==keccak256("sencom")){
					committed1 = 1;
					return true;
				}
				if(keccak256(choice)==keccak256("reccom")){
					committed1 = 2;
					return true;
				}
				if(keccak256(choice)==keccak256("mincom")){
					committed1 = 3;
					return true;
				}
			}
		}
		if(msg.sender ==user2){
			if(tempHash==hash2){
				if(keccak256(choice)==keccak256("senrev")){
					committed2 = 1;
					return true;
				}
				if(keccak256(choice)==keccak256("recrev")){
					committed2 = 2;
					return true;
				}
				if(keccak256(choice)==keccak256("minerrev")){
					committed2 = 3;
					return true;
				}
			}
		}
		return false;
	}

	function finalReveal() public initialCommit bothCommitted{
		if(committed1==committed2){
			user1.transfer(4990000000000000000);
			user2.transfer(4990000000000000000);
		}
		if((committed1==1 && committed2==3) || (committed1==2 && committed2==1) || (committed1==3 && committed2==2) || committed2==0)
			user1.transfer(9980000000000000000);
		if((committed1==3 && committed2==1) || (committed1==1 && committed2==2) || (committed1==2 && committed2==3) || committed1==0)
			user2.transfer(9980000000000000000);
		user1 = 0;
		user2 = 0;
		hash1 = bytes32(0);
		hash2 = bytes32(0);
		committed1 = 0;
		committed2 = 0;
	}
	// Function to get user 1
	function getUser1() public view returns (address) {
	  	return user1;
	}
	// Function to get user 2
	function getUser2() public view returns (address) {
	  	return user2;
	}

	function getState() public view returns (int) {
	  	if(hash1==bytes32(0) && hash2==bytes32(0))
	  		return 0;
	  	if(hash1==bytes32(0) && hash2!=bytes32(0))
	  		return 1;
	  	if(hash1!=bytes32(0) && hash2==bytes32(0))
	  		return 2;
	  	// Both users have committed at this point of time, return values if claimed
	  	int ans = 400 + (committed1*10 + committed2);

	  	return ans
	}
}
