//players information
 const player = {
   pokemon: [{
     name: "no pokemon yet",
     pokedexNum: 0,
     xp: 0,
     attacks:
       []
     }],
   bank: 0,
   wins: 0,
   losses: 0,
   turn: true,
 };

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
  let $attackButton1 = $('<div>').addClass('clickable');
  let $attackButton2 = $('<div>').addClass('clickable');

  //game information & storage
  let playersCurrentPokemon;
  let $playersPokemonImgSrc;
  const moveArray = [];
  let pokemonXP;
  let moveApiUrl = " ";
  let tempPokemonConfirmName;

  //opponent information
  let possOpponents = [{
    name: 'caterpie',
    level: 1,
    reward: 20,
    xp: 39
  },
  {
    name: 'pikachu',
    levle: 2,
    reward: 35,
    xp: 60
  }];
  let currentOpponentIndex = 0;
  let opponentPokemon = possOpponents[currentOpponentIndex].name;
  const oppMoveArray = [];
  let opponentXP = possOpponents[currentOpponentIndex].xp;


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
    console.log($chosenPokemonName);
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+ $chosenPokemonName,
    }).then(
      (data)=> {
        //update the player's object with the pokemon's name and base xp
        player.pokemon[0].name = data.name;
        player.pokemon[0].xp = data.base_experience;
        player.pokemon[0].pokedexNum = data.id;
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
    $playersPokemonImgSrc = $(event.currentTarget).parent().children('.poke-picture').children('img').attr('src')
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
    )
  }

  //confirm pokemon choice - we need this buffer in here to ensure that the API has pulled all the information into the players array before startng the first battle and rendering information
  const confirmPokemon = () => {
    //hide the div with the starter pokemon in it
    $choosePokemon.hide();
    //create a new div that the player can click on to confirm their choice
    ///*****NEEDS UPDATING FROM HARDCODED CHARMANDER*****
    let $confirmDiv = $('<div>').text('click here to confirm you want charmander').on('click', startFirstBattle).attr('id','confirm')
    //put this new div in the main area
    /////*****NEEDS STYLING!!******//
    $('.container').append($confirmDiv)
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
    $playersPokemonDiv.append($('<img>').attr('src', $playersPokemonImgSrc).addClass('players-pokemon-photo'))
    //show the name of the current pokemon
    console.log('player\'s current pokemon is '+ player.pokemon[0].name);
    $playersPokemonDiv.append($('<div>').text(player.pokemon[0].name).addClass('current-pokemon-name'))
    //display the pokemon's xp
    $playersPokemonDiv.append($('<div>').text('XP: '+ player.pokemon[0].xp).addClass('xp-stats'))
  }; //end of the createPlayersPokemonArea function

  //this function will create the opponent's area with all the opponent pokemon's information
  const createOpponentPokemonArea = () => {
    //hardcoded for now, needs to be updated eventually
    let caterpiePicture = $('<img>').attr('src', 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/010.png').addClass('players-pokemon-photo')
    $('.opponent-area').append(caterpiePicture)
    $('.opponent-area').append($('<div>').text("Caterpie").addClass('current-pokemon-name'))
    //pull information about the players current pokemon
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+possOpponents[currentOpponentIndex].name
    }).then(
      (data)=> {
        console.log(data);
        //loop through moves array and find the ones that have version group name "red-blue" && starter level 1
        for(let i = 0; i<data.moves.length; i++){
          let array1 = data.moves[i].version_group_details
          let versionLength = data.moves[i].version_group_details.length;
            for(let j = 0; j<versionLength; j++){
              if((array1[j].version_group.name === "red-blue") && (array1[j].level_learned_at === 1)) {
                let move = data.moves[i].move.name;
                oppMoveArray.push(move)
              };
            }
          } //end of the for loop
          //go through and list the attacks for this pokemon
          for(let k = 0; k<oppMoveArray.length; k++){
            $('.opponent-area').append($('<div>').text(oppMoveArray[k]).addClass('pokemon-move'))
          } //end of this for loop
          //display the starting XP for the pokemon
          let oppDisplayXP = $('<div>').text("XP: "+ opponentXP).addClass('xp-stats').attr('id', 'oppXpStat')
          $('.opponent-area').append(oppDisplayXP)
      })
  }// end of creating opponent area function

  //create the click area where the battle will happen.
  const initializeBattle = () => {
    let $desc = $('<div>').text('Beat the opponent\'s pokemon and get paid! Be careful, if your pokemon\'s XP gets to 0 you lose!')
    $('.click-area').append($desc)
    $('.click-area').append($battleStartButton)
 }

 //click listener for battle start button
 $battleStartButton.on('click', ()=>{
   $battleStartButton.hide();
   let $playerGoesFirstDiv = $('<div>').text('Go '+player.pokemon[0].name+"!")
   let $pickAnAttack = $('<div>').text('What attack do you want '+player.pokemon[0].name+' to do?')

   $('.click-area').append($playerGoesFirstDiv)
   $('.click-area').append($pickAnAttack)

   renderInBattleAttacks();
 })// end of battle start button click listener

//render the buttons for the battle
 let renderInBattleAttacks = () => {
   //this could get changed into a for loop...
     $('.click-area').append($attackButton1.text(player.pokemon[0].attacks[0].attackName).addClass('pokemon-move'));
     $('.click-area').append($attackButton2.text(player.pokemon[0].attacks[1].attackName).addClass('pokemon-move'))
 };//end of renderInBattleAttacks function

 //player's pokemon attack chosen
  $attackButton1.on('click', (event)=> {
   let attackClickedName = event.target.innerText
   // console.log(event.target.innerText);
   $.ajax ({
     url:'https://pokeapi.co/api/v2/move/?offset=0&limit=800'
      }).then(
        (data)=> {
          let resultsLength = data.results.length
          for(let i=0;i<resultsLength;i++){
            if (data.results[i].name === attackClickedName) {
              moveApiUrl = data.results[i].url;
              console.log(moveApiUrl);
              $getAttackStats(moveApiUrl);
              return;
            }//end of if statement
          }//end of for loop
     })//end of ajax call
   })//end of attack button 1 function

   //player's pokemon attack chosen
    $attackButton2.on('click', (event)=> {
     let attackClickedName = event.target.innerText
     // console.log(event.target.innerText);
     //this ajax call is to get the url for the attack, which will be used in the $getAttackStats function in another ajax call
     $.ajax ({
       url:'https://pokeapi.co/api/v2/move/?offset=0&limit=800'
        }).then(
          (data)=> {
            let resultsLength = data.results.length
            for(let i=0;i<resultsLength;i++){
              if (data.results[i].name === attackClickedName) {
                moveApiUrl = data.results[i].url;
                console.log(moveApiUrl);
                $getAttackStats(moveApiUrl);
                return;
              }
            }
       })
     })//end of attack button 2 function

 // update opponent's xp display function
 const updateOppXP = () => {
  $('#oppXpStat').text('XP: '+opponentXP);
  //ths will make it so that the opponent's turn is next
  playersTurn = false
 }

 //if the opponent's XP is 0 or less, it will display that they've fainted
 const opponentWasDefeatedDisplayUpdate = () => {
   $('#oppXpStat').text('The Pokemon Fainted!');
 }

 //function to check if opponent's XP is at 0 or less
 const checkForOppDefeat = () => {
   //if the opponent's xp is below 0, we will declare the player to be the winner
   if(opponentXP <= 0){
     opponentWasDefeatedDisplayUpdate();
     playerWins();
     //if the opponent still has XP, we will update the display and change the turn
   } else {
      updateOppXP();
   }
 }

//player wins function
  const playerWins = () => {
    //hide the battle area to display the win information
    $('.click-area').children().hide();
    //win display information
    let $youWinAlert = $('<div>').text('You beat '+possOpponents[currentOpponentIndex].name+'! You earned '+possOpponents[currentOpponentIndex].reward+' coins. Great job!').addClass('winDiv');
    $('.click-area').append($youWinAlert)
    //add the reward type to the player's bank
    playersBank = playersBank + parseInt(possOpponents[currentOpponentIndex].reward)
    console.log('the player now has '+playersBank+' coins');
    //change the opponent's pokemon to the next in the array
    currentOpponentIndex++
  }

//next battle function



}) //closing tag for page load function
