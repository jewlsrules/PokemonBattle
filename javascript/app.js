$(()=>{

  //basic layout set up
  const $choosePokemon = $('.choose-pokemon')
  let $clickToPick = $('.click-to-pick')
  let $playersPokemonDiv = $('.players-pokemon')
  let $battleStartButton = $('<div>').text('Start Battle').attr('id', 'start-battle')

  //game information & storage
  let playersTurn = true

 //players information
  let playersCurrentPokemon
  let $playersPokemonImgSrc;
  const moveArray = [];
  let pokemonXP
  let wins = 0;
  let losses = 0;

  //opponent information
  let possOpponents = [{
    name: 'caterpie',
    level: 1,
    reward: 20
  },
  {
    name: 'pikachu',
    levle: 2,
    reward: 35
  }]
  let currentOpponentIndex = 0
  let opponentPokemon = possOpponents[currentOpponentIndex]
  const oppMoveArray = [];
  let opponentXP

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
          opponentXP = data.base_experience;
          let oppDisplayXP = $('<div>').text("XP: "+ opponentXP).addClass('xp-stats')
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
   let $pickAnAttack = $('<div>').text('What do you want '+playersCurrentPokemon+' to do?')

   $('.click-area').append($playerGoesFirstDiv)
   $('.click-area').append($pickAnAttack)

   for(let k = 0; k<moveArray.length; k++){
     $('.click-area').append($('<div>').text(moveArray[k]).addClass('pokemon-move clickable'))
   }
 })


}) //closing tag for page load function
