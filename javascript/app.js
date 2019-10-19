$(()=>{

  //basic layout set up
  const $choosePokemon = $('.choose-pokemon')
  let $clickToPick = $('.click-to-pick')
  let $playersPokemonDiv = $('.players-pokemon')
  let $battleStartButton = $('<div>').text('Start Battle').attr('id', 'start-battle')
  let $attackButton1 = $('<div>').addClass('clickable')
  let $attackButton2 = $('<div>').addClass('clickable')
  let renderInBattleAttacks = () => {
      $('.click-area').append($attackButton1.text(moveArray[0]).addClass('pokemon-move'));
      $('.click-area').append($attackButton2.text(moveArray[1]).addClass('pokemon-move'))
  }

  //game information & storage
  let playersTurn = true

 //players information
  let playersCurrentPokemon
  let $playersPokemonImgSrc;
  const moveArray = [];
  let pokemonXP
  let wins = 0;
  let losses = 0;
  let moveApiUrl = " "
  let playersBank = 0;

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
  }]
  let currentOpponentIndex = 0
  let opponentPokemon = possOpponents[currentOpponentIndex].name
  const oppMoveArray = [];
  let opponentXP = possOpponents[currentOpponentIndex].xp

  //click function for choosing your pokemon
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
    let $clickParent = $(event.target).parent().parent();
    let $pokemonName = $clickParent.children('.poke-picture').children('img').attr('id')
    //when a player selects a pokemon, it should hide the picker area
    $choosePokemon.hide();
    //change the player's pokemon to the one that was chosen.
    playersCurrentPokemon = $pokemonName
    //get the url of the current pokemon's photo to display in the battle area div
    $playersPokemonImgSrc = $clickParent.children('.poke-picture').children('img').attr('src');
    createPlayersPokemonArea();
    createOpponentPokemonArea();
    initializeBattle();
  })

  const createPlayersPokemonArea = () => {
    //show the div that most of the game action will happen in.
    $('.battle-play').show().css('display', 'flex');
    //show the photo of the pokemon that was chosen
    $playersPokemonDiv.append($('<img>').attr('src', $playersPokemonImgSrc).addClass('players-pokemon-photo'))
    //show the name of the current pokemon
    $playersPokemonDiv.append($('<div>').text(playersCurrentPokemon).addClass('current-pokemon-name'))
    //pull information about the players current pokemon
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+playersCurrentPokemon,
    }).then(
      (data)=> {
        //loop through moves array and find the ones that have version group name "red-blue" && starter level 1
        for(let i = 0; i<data.moves.length; i++){
          let array1 = data.moves[i].version_group_details
          let versionLength = data.moves[i].version_group_details.length;
            for(let j = 0; j<versionLength; j++){
              if((array1[j].version_group.name === "red-blue") && (array1[j].level_learned_at === 1)) {
                let move = data.moves[i].move.name;
                moveArray.push(move)
              };
            }
          } //end of the for loop
          //go through and list the attacks for this pokemon
          for(let k = 0; k<moveArray.length; k++){
            $('.players-pokemon').append($('<div>').text(moveArray[k]).addClass('pokemon-move'))
          } //end of this for loop
          //display the starting XP for the pokemon
          let pokemonXP = data.base_experience;
          let displayXP = $('<div>').text("XP: "+ pokemonXP).addClass('xp-stats')
          $('.players-pokemon').append(displayXP)
      })
  }; //end of the createPlayersPokemonArea function

  const createOpponentPokemonArea = () => {
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
   let $playerGoesFirstDiv = $('<div>').text('Go '+playersCurrentPokemon+"!")
   let $pickAnAttack = $('<div>').text('What attack do you want '+playersCurrentPokemon+' to do?')

   $('.click-area').append($playerGoesFirstDiv)
   $('.click-area').append($pickAnAttack)

   renderInBattleAttacks();
 })// end of battle start button click listener

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
            }
          }
     })
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

 //this will get the attack power from the API and reduce the opponent's XP by that much.
 //this is nested inside of the click function for when a player chooses an attack
 const $getAttackStats = (url) => {
   $.ajax ({
     //we get the url from the attack button click listener
     url: url
   }).then(
     (data) => {
       if(data.power){
         //get the attack power base & turn it into an integer
         let attackInt = parseInt(data.power)
         //turns the current xp into an integer
         let opponentXpInt = parseInt(possOpponents[currentOpponentIndex].xp)
         //get the resulting xp after the attack and update the object
         possOpponents[currentOpponentIndex].xp = opponentXpInt - attackInt
         opponentXP = possOpponents[currentOpponentIndex].xp
         //function to update the display of the opponent's XP.
         checkForOppDefeat();
       } else {
         //if the attack has null power, it will not take away from opponent's xp
         console.log('The attack had no effect!');
       }
     }
   )
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
