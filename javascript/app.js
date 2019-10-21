//players information
 const player = {
   pokemon: [{
     name: "no pokemon yet",
     pokedexNum: 0,
     img: " ",
     xp: 0,
     maxxp: 0,
     attacks:
       []
     }],
   bank: 0,
   wins: 0,
   losses: 0,
   turn: true,
   items: [],
 };

 //opponent information
 let possOpponents = [{
   name: 'caterpie',
   photoUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/010.png',
   level: 1,
   reward: 20,
   xp: 48,
   maxxp: 48,
   accuracy: 1,
   attacks: [{
       attackName: 'tackle',
       power: 20,
       liklihood: .25
     },
     {
       attackName: 'string-shot',
       power: 5,
       liklihood: .75
     }]
 },
 {
   name: 'pidgey',
   photoUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/016.png',
   level: 2,
   reward: 30,
   xp: 55,
   maxxp: 55,
   accuracy: .75,
   attacks: [{
       attackName: 'razor-wind',
       power: 30,
       liklihood: .4
     },
     {
       attackName: 'gust',
       power: 5,
       liklihood: .6
     }]
 },
 {
   name: 'pikachu',
   photoUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png',
   level: 3,
   reward: 40,
   xp: 60,
   maxxp: 60,
   accuracy: .9,
   attacks: [{
       attackName: 'mega-punch',
       power: 35,
       liklihood: .5
     },
     {
       attackName: 'pay-day',
       power: 10,
       liklihood: .5
     }]
 },
 ];

 //items in shop array
 itemsForSale = []

//on load
$(()=>{

  ///////////////////////
  //Variable Set Up
  ///////////////////////

  //basic layout set up
  const $choosePokemon = $('.choose-pokemon');
  let $clickToPick = $('.click-to-pick');
  let $playersPokemonDiv = $('.players-pokemon');
  let $battleStartButton = $('<div>').text('Start Battle').attr('id', 'start-battle');
  let $attackButton1 = $('<h2>').addClass('choice-button');
  let $attackButton2 = $('<h2>').addClass('choice-button');
  $('.other-options').hide();
  $('.pokemart').hide();
  $('.pokemon-center').hide();

  //player's pokemon display
  // let $playersPokemon = $('<div>').addClass('showPlayerPokemon')
  //   $playersPokemon.append($('<img>').attr('src', player.pokemon[0].img).addClass('players-pokemon-photo'));
  //   $playersPokemon.append($('<div>').text(player.pokemon[0].name).addClass('current-pokemon-name'))
  //   //display the pokemon's xp
  //   $playersPokemon.append($('<div>').text('XP: '+ player.pokemon[0].xp+'/'+player.pokemon[0].maxxp).addClass('xp-stats').attr('id', 'playersXP'));

  //game information & storage
  let playersCurrentPokemon;
  let $playersPokemonImgSrc = " ";
  const moveArray = [];
  let pokemonXP;
  let moveApiUrl = " ";
  let tempPokemonConfirmName;
  let tempPower

  let currentOpponentIndex = 0;
  let opponentPokemon = possOpponents[currentOpponentIndex].name;
  const oppMoveArray = [];
  let opponentXP = possOpponents[currentOpponentIndex].xp;
  let opponentChosenAttack
  let tempOppPower


  ////////////////////////////
  //Game Play Functions
  ////////////////////////////


  ////////////////////////////
  //Game Set Up
  ////////////////////////////

  //click function for seeing additional Pokemon information
  $('.poke-picture').on('click', (event)=> {
    let $pokemonName = $(event.currentTarget).children('img').attr('id')
    let $pokemonModal = $(event.currentTarget).children('.modal');
    //toggle seeing the pokemon's information or not.
    $pokemonModal.toggle();
    //api pull to get pokemon information for only the pokemon that was clicked
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+$pokemonName,
    }).then(
      (data)=> {
        let $pokemonName = data.name
        let $pokemonXP = data.base_experience
        //put the data from the api into the modal.
        $('.poke-type').text($pokemonName)
        $('.poke-xp').text($pokemonXP)
      })
  }) //closing tag for click function

  //click function to choose your starting pokemon
  $clickToPick.on('click', (event)=>{
    //retrieve the name of the pokemon that was clicked on
    let $chosenPokemonName = $(event.currentTarget).parent().children('.poke-picture').children('img').attr('id')
    tempPokemonConfirmName = $chosenPokemonName
    console.log($chosenPokemonName);
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+ $chosenPokemonName,
    }).then(
      (data)=> {
        //update the player's object with the pokemon's name, base xp, & pokedex #
        player.pokemon[0].name = data.name;
        player.pokemon[0].xp = data.base_experience;
        player.pokemon[0].maxxp = data.base_experience;
        //loop through moves array and find the ones that have version group name "red-blue" && starter level 1
            for(let i = 0; i<data.moves.length; i++){
              let array1 = data.moves[i].version_group_details
              let versionLength = data.moves[i].version_group_details.length;
                for(let j = 0; j<versionLength; j++){
                  //only find moves from red & blue original games
                  if((array1[j].version_group.name === "red-blue") && (array1[j].level_learned_at === 1)) {
                    let moveName = data.moves[i].move.name;
                    //this function will find the attack URL and eventually push the moves into the player's pokemon's array
                    findAttackID(moveName)
                  };
                }
              } //end of the for loop
        // console.log(player);
    })
    //save the url of the chosen pokemon to use in the battle area
    $playersPokemonImgSrc = $(event.currentTarget).parent().children('.poke-picture').children('img').attr('src');
    player.pokemon[0].img = $(event.currentTarget).parent().children('.poke-picture').children('img').attr('src')
    //confirm the pokemon choice to allow time for API to populate player's object with pokemon information'
    confirmPokemon();
  })

//function to find the information about the moves for a pokemon
  const findAttackID = (attack) => {
    // console.log('starting findAttackID function, looking for '+attack);
    $.ajax ({
      //this will pull up all attacks, not limited to an amount per page
      url:'https://pokeapi.co/api/v2/move/?offset=0&limit=800'
       }).then(
         (data)=> {
           //variable for the length of the results array
           let resultsLength = data.results.length
           // console.log('find attack ID returned this many results: '+resultsLength);
           //loop through each attack and find only the ones we're looking for
           for(let i=0;i<resultsLength;i++){
             if (data.results[i].name === attack) {
               //get the url of the attacks that we're looking for and store them in a variable
               moveApiUrl = data.results[i].url;
               // console.log('url for '+attack+'found: '+moveApiUrl);
               //the next function will pull up an api request using the found URL to get the stats for that particular attack
               $getAttackStats(moveApiUrl);
               return;
             }
           }
      })
  }

  //this function goes to the attack's API page and pulls information from that and stores it in the user's pokemon array
  const $getAttackStats = (url) => {
    $.ajax ({
      //we get the url from the attack button click listener
      url: url
    }).then(
      (data) => {
          //get the attack power base & turn it into an integer
          let attackInt = parseInt(data.power)
          // console.log('finding the data for '+ data.name + '. power is: ' + data.power);
          //push attack information into player's pokemon's attack array
          player.pokemon[0].attacks.push({attackName: data.name, power: attackInt})
      }
    )//end of ajax call
  }//end of $getAttackStats

  //confirm pokemon choice - we need this buffer in here to ensure that the API has pulled all the information into the players array before startng the first battle and rendering information
  const confirmPokemon = () => {
    //hide the div with the starter pokemon in it
    $choosePokemon.hide();
    //create a new div that the player can click on to confirm their choice
    ///*****NEEDS UPDATING FROM HARDCODED CHARMANDER*****
    let $confirmDiv = $('<div>').attr('id', 'confirm')
    let $confirmText = $('<h2>').text('Are you sure you want '+tempPokemonConfirmName+'? You can only choose your starting pokemon once, so choose wisely!')
    let $confirmChoosePokemon = $('<h2>').text('Yes, I choose you, '+tempPokemonConfirmName+'!').on('click', startFirstBattle).addClass('click-to-pick')
    //put this new div in the main area
    /////*****NEEDS STYLING!!******//
    $('.container').append($confirmDiv);
    $confirmDiv.append($confirmText);
    $confirmDiv.append($confirmChoosePokemon);
  }

  /////////////////////////////////
  //FIRST BATTLE LOGIC
  /////////////////////////////////

  //initialize first battle Function
  const startFirstBattle = () => {
    //hide the confirmation div, we no longer need it after the player has confirmed
    $('#confirm').hide();
    //create the div that shows the players pokemon information
    createPlayersPokemonArea();
    //create the div that shows the opponent's pokemon information
    createOpponentPokemonArea();
    initializeBattle();
  };

  //this function will create the player's pokemon area and get data from the player object
  const createPlayersPokemonArea = () => {
    //show the div that most of the game action will happen in.
    $('.battle-play').show().css('display', 'flex');
    //show the photo of the pokemon that was chosen
    $playersPokemonDiv.append($('<img>').attr('src', $playersPokemonImgSrc).addClass('players-pokemon-photo').attr('id', 'playersPokePhoto'))
    //show the name of the current pokemon
    console.log('player\'s current pokemon is '+ player.pokemon[0].name);
    $playersPokemonDiv.append($('<div>').text(player.pokemon[0].name).addClass('current-pokemon-name'))
    //display the pokemon's xp
    let $playersXPDisplay = $('<div>').text('HP: '+ player.pokemon[0].xp+'/'+player.pokemon[0].maxxp).addClass('xp-stats').attr('id', 'playersXP');
    $playersPokemonDiv.append($playersXPDisplay)
  }; //end of the createPlayersPokemonArea function

  //this function will create the opponent's area with all the opponent pokemon's information
  const createOpponentPokemonArea = () => {
    //hardcoded for now, needs to be updated eventually
    let caterpiePicture = $('<img>').attr('src', possOpponents[currentOpponentIndex].photoUrl).addClass('players-pokemon-photo').attr('id','oppPhoto')
    $('.opponent-area').append(caterpiePicture)
    $('.opponent-area').append($('<div>').text(possOpponents[currentOpponentIndex].name).addClass('current-pokemon-name'))
    //display the starting XP for the pokemon
    let oppDisplayXP = $('<div>').text("HP: "+ possOpponents[currentOpponentIndex].xp+'/'+possOpponents[currentOpponentIndex].maxxp).addClass('xp-stats').attr('id', 'oppXpStat')
    $('.opponent-area').append(oppDisplayXP)
    //display reward for defeating pokemon
    let $rewardDisplay = $('<h3>').text('Reward: '+possOpponents[currentOpponentIndex].reward+' coins')
    $('.opponent-area').append($rewardDisplay)
  }// end of creating opponent area function

  //create the click area where the battle will happen.
  const initializeBattle = () => {
    let $desc = $('<h2>').text('Beat the opponent\'s pokemon and get a reward! Be careful, if your pokemon\'s HP gets to 0 you lose!')
    $('.click-area').append($desc)
    $('.click-area').append($battleStartButton)
 }

 //click listener for battle start button
 $battleStartButton.on('click', ()=>{
   playerFight();
 })// end of battle start button click listener

//render the buttons for the battle
 let renderInBattleAttacks = () => {
   //this could get changed into a for loop...
  $('.click-area').append($('<div>').addClass('battle-attack-picker'))
  $('.battle-attack-picker').append($attackButton1.text(player.pokemon[0].attacks[0].attackName));
     $attackButton1.on('click', (event)=> {
       attackFunction();
     });
  $('.battle-attack-picker').append($attackButton2.text(player.pokemon[0].attacks[1].attackName).addClass('pokemon-move'));
     $attackButton2.on('click', (event)=> {
       attackFunction();
     })
 };//end of renderInBattleAttacks function

 //attack Function
 let attackFunction = () => {
   $('#playersPokePhoto').addClass('player-attack-animation');
   let attackClickedName = event.target.innerText
   // console.log(event.target.innerText);
   console.log(attackClickedName);
   //find the attack in the player's pokemon moves array and return it's power.
   for(let i=0;i<player.pokemon[0].attacks.length;i++){
     if(player.pokemon[0].attacks[i].attackName === attackClickedName && player.pokemon[0].attacks[i].power) {
       console.log('this attack does damage of: '+player.pokemon[0].attacks[i].power);
       tempPower = parseInt(player.pokemon[0].attacks[i].power)
       //reduce the opponent's current pokemon's xp by the amount of power in the attack
       possOpponents[currentOpponentIndex].xp = parseInt(possOpponents[currentOpponentIndex].xp) - tempPower
       console.log('opponent\'s HP is now '+ possOpponents[currentOpponentIndex].xp);
       checkForOppDefeat();
       return;
     } else {
       tempPower = 0
       console.log('this attack doesn\'t do any damage');
       checkForOppDefeat();
     }
     //end of if statement
   }//end of for loop
   // console.log('temp power variable: '+tempPower);
 }

 // update opponent's xp display function
 const updateOppXP = () => {
  $('#oppXpStat').text('HP: '+possOpponents[currentOpponentIndex].xp+'/'+possOpponents[currentOpponentIndex].maxxp);
  //ths will make it so that the opponent's turn is next
  playersTurn = false
 }

 //if the opponent's XP is 0 or less, it will display that they've fainted
 const opponentWasDefeatedDisplayUpdate = () => {
   $('#oppXpStat').text('The Pokemon Fainted!');
   $('#oppPhoto').addClass('fainted')
 }

 //function to check if opponent's XP is at 0 or less
 const checkForOppDefeat = () => {
   console.log('now checking for opponent\'s defeat');
   //if the opponent's xp is below 0, we will declare the player to be the winner
   if(possOpponents[currentOpponentIndex].xp <= 0){
     //display the xp for the opponent as fainted
     opponentWasDefeatedDisplayUpdate();
     playerWins();
     //if the opponent still has XP, we will update the display and change the turn
   } else {
     console.log('opponent was not defeated, game on.');
     //take away the attack buttons
     $('.click-area').empty()
     //find out how much damage was done and display it instead of attack buttons
     let $damageReport = $('<h2>').text('Your attack did '+tempPower+' damage!');
     $('.click-area').append($damageReport);
     //update the xp display for the opponent
      updateOppXP();
      //go on to the opponent's attack
      opponentAttack();
   }
 }//end of check for OppDefeat function

  //player wins function
  const playerWins = () => {
    $('#playersPokePhoto').removeClass('player-attack-animation')
    $('#playersPokePhoto').addClass('winner')
    //hide the battle area to display the win information
    $('.click-area').children().hide();
    //win display information
    let $youWinAlert = $('<h2>').text('You beat '+possOpponents[currentOpponentIndex].name+'! You earned '+possOpponents[currentOpponentIndex].reward+' coins. Great job!').addClass('winDiv');
    $('.click-area').append($youWinAlert)
    //add the reward type to the player's bank
    player.bank = player.bank + parseInt(possOpponents[currentOpponentIndex].reward)
    console.log('the player now has '+player.bank+' coins');
    //change the opponent's pokemon to the next in the array
    currentOpponentIndex++
    player.wins++
    $('#players-bank').text(player.bank)
    // console.log('player has won this many times: '+player.wins);
    //after the player wins the first, easy round which is designed to get them used to how to battle and which attacks they should use, they'll be able to explore the other options in the game.
    if(player.wins === 1) {
      $('.other-options').show();
      let $introducePokeCenter = $('<div>')
      $('.click-area').append($introducePokeCenter);
      $('#poke-center').addClass('new-shop')
      let $coinIntroduction = $('<h3>').text('Your Pokemon took damage, let\'s go to the Pokemon Center to get it healed.');
      $('.click-area').append($coinIntroduction)
      //if the player has one 2x they will unlock the pokemart where they can purchase items for sale
    } else if (player.wins === 2){
      $('#pokemart').addClass('new-shop')
      let $unlockPokemart = $('<div>')
      $unlockPokemart.append($('<h2>').text('You\'ve unlocked the PokeMart!'))
      $unlockPokemart.append($('<h2>').text('Let\'s go there now and see what\'s for sale.'))
      $unlockPokemart.append($('<h2>').text('Go To Pokemart').addClass('choice-button'))
      $('#pokemart').children('img').removeClass('locked')
      $('#pokemart').addClass('available');
      $('#pokemart').children('h1').text('Pokemart')
      $('.click-area').append($unlockPokemart)
    }
    else {
      console.log('player doesn\'t have a win');
    }
  }//end of playerWins function

  //opponent attack Function
  const opponentAttack = () => {
    let $opponentAttackedDiv = $('<div>').addClass('opponent-attack-text')
    $('.click-area').append($opponentAttackedDiv)
    console.log('oppenent is attacking');
    //create a random number to choose opponent's attack based on liklihood
    let attackChooser = Math.random()
    // console.log('randomly generated number: '+attackChooser);
    // console.log('likelihood of first attack: '+possOpponents[currentOpponentIndex].attacks[0].liklihood);
    //based on random number & each move's likelihood of happening, pick an attack
    if(attackChooser < possOpponents[currentOpponentIndex].attacks[0].liklihood){
      // console.log(possOpponents[currentOpponentIndex].name + ' attacked with 1st attack: '+possOpponents[currentOpponentIndex].attacks[0].attackName);
      //reduce player's pokemon by the amount of the attack
      opponentChosenAttack = possOpponents[currentOpponentIndex].attacks[0].attackName;
      tempOppPower = possOpponents[currentOpponentIndex].attacks[0].power
      player.pokemon[0].xp = player.pokemon[0].xp - tempOppPower;
    } else {
      // console.log(possOpponents[currentOpponentIndex].name + ' attacked with 2nd attack:  '+possOpponents[currentOpponentIndex].attacks[1].attackName);
      tempOppPower = possOpponents[currentOpponentIndex].attacks[1].power
      player.pokemon[0].xp = player.pokemon[0].xp - tempOppPower;
      opponentChosenAttack = possOpponents[currentOpponentIndex].attacks[1].attackName;
    } //end of if statement
    checkIfPlayerLost();
  }//end of opponentAttack function

  //check if player lost Function
  const checkIfPlayerLost = () => {
    //if the players pokemon still has xp left, we continue to play and let the player choose what to do.
    if (player.pokemon[0].xp > 0) {
      //text displaying in the middle showing how much damage was done and by what attack.
      let $damageText = $('<h2>').text(possOpponents[currentOpponentIndex].name+' attacked '+ player.pokemon[0].name+" using "+opponentChosenAttack +" and did "+ tempOppPower+" damage!");
      //append that to the middle div
      $('.click-area').append($damageText);
      // console.log('opponent used '+ opponentChosenAttack);
      // console.log('your pokemon now has ' + player.pokemon[0].xp+' xp left');
      //change user's pokemon's display to their current XP
      $('#playersXP').text('HP: '+player.pokemon[0].xp+'/'+player.pokemon[0].maxxp);
      let $chooseNextStep = $('<h2>').text('What do you want to do next?')
      //create an area for the user to choose the next step
      $('.click-area').append($chooseNextStep)
      //2 options for the user 1. attack again
      let $attackChoice = $('<h3>').text('Keep Fighting').addClass('choice-button').attr('id', 'keep-fighting');
      $attackChoice.on('click', ()=>{
        console.log('let\'s attack!');
        playerFight();
      })
      //2. run away
      let $runAwayChoice = $('<h3>').text('Run Away').addClass('choice-button').attr('id', 'run-away');
      $runAwayChoice.on('click', ()=> {
        console.log('run away!!');
      })
      //put these in the player's choice div
      $chooseNextStep.append($attackChoice);
      $chooseNextStep.append($runAwayChoice);
      //change the turn so that it's the player's turn again
      player.turn = true;
    } else {
      $('#playersXP').text('Your Pokemon Fainted!');
      alert('You lose.');
    }
  }

  //function to keep Fighting
  const playerFight = () => {
    $('#playersPokePhoto').removeClass('player-attack-animation')
    console.log('removing player attack class');
    $('.click-area').empty();
    let $playerGoesFirstDiv = $('<h2>').text('Go '+player.pokemon[0].name+"!")
    let $pickAnAttack = $('<h2>').text('What attack do you want '+player.pokemon[0].name+' to do?')

    $('.click-area').append($playerGoesFirstDiv)
    $('.click-area').append($pickAnAttack)

    renderInBattleAttacks();
  }

  /////////////////////////
  //Poke-hospital
  /////////////////////////

  //when the player clicks on the pokecenter icon, show them the poke center and hide the battle area.
  $('#poke-center').on('click', () => {
    $('.pokemart').hide();
    $('.healed').hide();
    $('.poke-center-change').show();
    $('#poke-center').removeClass('new-shop')
    console.log('user clicked on the pokemon center');
    //hide the battle area
    $('.battle-play').hide();
    // $('.pokemon-center').empty();
    $('.pokemon-center').show();
    $('.pokemon-center').children('.left').empty();
    let $playersPokemon = $('<div>').addClass('showPlayerPokemon')
      $playersPokemon.append($('<img>').attr('src', player.pokemon[0].img).addClass('players-pokemon-photo'));
      $playersPokemon.append($('<div>').text(player.pokemon[0].name).addClass('current-pokemon-name'))
      //display the pokemon's xp
      $playersPokemon.append($('<div>').text('HP: '+ player.pokemon[0].xp+'/'+player.pokemon[0].maxxp).addClass('xp-stats').attr('id', 'playersXP'));
    $('.pokemon-center').children('.left').append($playersPokemon)
  })

  $('#heal-pokemon').on('click', () => {
    player.pokemon[0].xp = player.pokemon[0].maxxp;
    player.bank = player.bank - 5
    $('#players-bank').text(player.bank)
    console.log(player);
    $('.pokemon-center').children('.left').empty();
    let $playersPokemon = $('<div>').addClass('showPlayerPokemon')
      $playersPokemon.append($('<img>').attr('src', player.pokemon[0].img).addClass('players-pokemon-photo'));
      $playersPokemon.append($('<div>').text(player.pokemon[0].name).addClass('current-pokemon-name'))
      //display the pokemon's xp
      $playersPokemon.append($('<div>').text('HP: '+ player.pokemon[0].xp+'/'+player.pokemon[0].maxxp).addClass('xp-stats').attr('id', 'playersXP'));
    $('.pokemon-center').children('.left').append($playersPokemon)
    $('.welcome').children().hide();
    $('.healed').empty();
    $('.healed').append($('<h2>').text(player.pokemon[0].name + " looks like they're healed up and ready for another battle!"));
    $('.healed').append($('<h2>').text('Return to Battle Arena').addClass('choice-button').attr('id', 'returnToBattleButton').on('click', returnToBattle));
    $('.healed').show();
  })

  ///////////////////////////
  //2nd + Battle
  ///////////////////////////

  //return to battle Function
  const returnToBattle = () => {
    $('.pokemon-center').hide();
    renderNextBattle();
  }

  //render the next battle Function
  const renderNextBattle = () => {
    //make it so the pokemon picture doesn't dance on start up
    $('#playersPokePhoto').removeClass('winner');
    //update the player's XP to it's current XP
    $('#playersXP').text('HP: '+player.pokemon[0].xp+'/'+player.pokemon[0].maxxp);
    //show the div for battle
    $('.battle-play').show();
    //empty the old text that was in the click area div
    $('.click-area').empty();
    initializeBattle();
    $battleStartButton.on('click', playerFight)
    //show information about the next opponent before the battle begins
    $('.opponent-area').empty();
    $('.opponent-area').append($('<h2>').text("Next Opponent:"));
    $('.opponent-area').append($('<img>').attr('src', possOpponents[currentOpponentIndex].photoUrl).addClass('players-pokemon-photo'));
    $('.opponent-area').append($('<h2>').text(possOpponents[currentOpponentIndex].name).addClass('current-pokemon-name'));
    $('.opponent-area').append($('<div>').text("HP: "+ possOpponents[currentOpponentIndex].xp+'/'+possOpponents[currentOpponentIndex].maxxp).addClass('xp-stats').attr('id', 'oppXpStat'));
    $('.opponent-area').append($('<h3>').text('Reward: '+possOpponents[currentOpponentIndex].reward+' coins'));
    //show information about the next opponent before the battle begins
  }

  /////////////////////////
  //POKEMART
  /////////////////////////
  $('#pokemart').on('click', ()=>{
    console.log('user clicked on pokemart');
    $('#pokemart').removeClass('new-shop')
    renderPokemart();
  })

  //if this is the player's first visit to the pokemart, then we should introduce them to what it is and how to buy products
  const renderPokemart = () => {
    //hide the battle area
    $('.battle-play').hide();
    //show the shop div
    $('.pokemart').show();
    $('.welcome').show();
    $('.welcome').children().show();
    $('.pokemon-center').hide();
    $('.shop-items')
    if(!player.items[0]){
      $('.current-inventory').append($('<h3>').text('You have no items.'))
    } else {
      let $itemList = $('<ul>');
      for(let i = 0; i<player.items.length; i++){
        $itemList.append($('<li>').text(player.items[i].itemName))
      }//end of for loop
      $('.current-inventory').append($itemList)
    }//end of if statement
  }//end of render pokemart function


}) //closing tag for page load function
