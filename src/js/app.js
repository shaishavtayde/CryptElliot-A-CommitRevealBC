App = {
  web3Provider: null,
  contracts: {},
  registered: false,
  init: function() {

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('CommitReveal.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CommitRevealArtifact = data;
      App.contracts.RPS = TruffleContract(CommitRevealArtifact);

      // Set the provider for our contract
      App.contracts.RPS.setProvider(App.web3Provider);

    });

    return;
  },

  getUser : function(id){
    var crInstance;

      App.contracts.RPS.deployed().then(function(instance) {
        crInstance = instance;
        if(id==1)
          return crInstance.getUser1.call();
        else
          return crInstance.getUser2.call();
      }).then(function(address){
        if(id==1)
          document.getElementById("user1").innerHTML = address;
        else
          document.getElementById("user2").innerHTML = address;
      }).catch(function(err) {
        console.log(err.message);
      });
  },

  registerUser : function(){
    var rpsInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      console.log(account)
      App.contracts.CommitReveal.deployed().then(function(instance) {
        rpsInstance = instance;
        return crInstance.register({from: account, value:web3.toWei(5, "ether")}) // you can change the transaction amount from here
      }).then(function(){
        console.log("Successfully Registered User1");
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getState : function(callback){
    var crInstance;
    App.contracts.CommitReveal.deployed().then(function(instance) {
      crInstance = instance;
      return crInstance.getState.call();
    }).then(function(state){
      if(state==0)
          document.getElementById("state").innerHTML = "A decentralized app built to increase transaction confidentiality and enhance security. ";
      if(state==1)
          document.getElementById("state").innerHTML = "Node2 Commit";
      if(state==2)
          document.getElementById("state").innerHTML = "Node1 Commit";
      if(state>=3){
          document.getElementById("state").innerHTML = "Both Nodes Commit ---->";
          var choices=["","sencom","revcom","minercom"];
          var committed2 = state%10;
          var committed1 = Math.floor(state/10)%10;
          if(committed1!=0)
            document.getElementById("state").innerHTML += ((committed1==4)?" User1 Timed out":" Node 1 reveal ---->");
          if(committed2!=0)
            document.getElementById("state").innerHTML += ((committed2==4)?" User2 Timed out":" Node 2 reveal ");
        }
        if(callback)
          callback(state);
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  lockUserChoice: function(){
    var rpsInstance;
    var e = document.getElementById("choice");
    var choice = e.options[e.selectedIndex].value;
    str = document.getElementById("c2").value;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      console.log(account)
      App.contracts.RPS.deployed().then(function(instance) {
        rpsInstance = instance;
        return rpsInstance.lock(choice, str, {from: account})
      }).then(function(result){
        if(result==0)
          console.log("Could not lock choice");
        else
          console.log("Successfully Locked User, result = "+result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  unlockUserChoice: function(){
    var rpsInstance;
    var e = document.getElementById("choice2");
    var choice = e.options[e.selectedIndex].value;
    str = document.getElementById("o2").value;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      console.log(account);
      App.contracts.RPS.deployed().then(function(instance) {
        rpsInstance = instance;
        return rpsInstance.open(choice, str, {from: account})
      }).then(function(result){
        globalResult = result;
        if(result==0)
          console.log("Could not unlock with given (choice,string)");
        else
          console.log("Successfully Claimed User, result = "+result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  amIRegistered: function(callback){
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      if(document.getElementById("user1").innerHTML==account)
        registered = 1;
      else if(document.getElementById("user2").innerHTML==account)
        registered = 2;
      else registered = 0;
      callback(registered);
    });
  },
  finalrev: function(callback){
    var rpsInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.RPS.deployed().then(function(instance) {
        rpsInstance = instance;
        return rpsInstance.processRewards({from: account, gas: "100000"});
      }).then(function(result){
        console.log("Successfully collectRewards");
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

// This function is called at regular intervals, it checks game state and updates the UI accordingly
function updateUserState(){
  App.amIRegistered(function(registered){
    App.getGameState(function(state){
      state = parseInt(state)
      console.log("Registered = "+registered + " Game state = "+state);

      // Switch on/off section 1
      if(document.getElementById("section1").style.display=="none")
        if(!registered)
          document.getElementById("section1").style.display="block";
      if(document.getElementById("section1").style.display=="block")
        if(registered)
          document.getElementById("section1").style.display="none";

      // Switch on/off section 2
      if(document.getElementById("section2").style.display=="none")
        if(registered && state<=3)
          document.getElementById("section2").style.display="block";
      if(document.getElementById("section2").style.display=="block")
        if(!registered || state>=3)
          document.getElementById("section2").style.display="none";

      // Switch on/off section 3
      if(document.getElementById("section3").style.display=="none")
        if(registered && state>=3 && (state%10==0 || Math.floor(state/10)%10==0))
          document.getElementById("section3").style.display="block";
      if(document.getElementById("section3").style.display=="block")
        if(!registered || state<=3 || (state%10!=0 && Math.floor(state/10)%10!=0))
          document.getElementById("section3").style.display="none";

      // Switch on/off section 4
      if(document.getElementById("section4").style.display=="none")
        if(state>=3 && state%10!=0 && Math.floor(state/10)%10!=0)
          document.getElementById("section4").style.display="block";
      if(document.getElementById("section4").style.display=="block")
        if(state<3 || state%10==0 || Math.floor(state/10)%10==0)
          document.getElementById("section4").style.display="none";
    })
  });
}

var globalResult = "";
$(function() {
  $(window).load(function() {
    App.init();
     setInterval(function(){
        App.getUser(1);
        App.getUser(2);
        updateUserState();
      }, 2000);
  });

});
