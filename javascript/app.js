$(()=>{

  const $choosePokemon = $('.choose-pokemon')
  let $clickToPick = $('.click-to-pick')
  let playersCurrentPokemon
  let $playersPokemonDiv = $('.players-pokemon')
  let $playersPokemonImgSrc

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

  })

  const createPlayersPokemonArea = () => {
    $('.battle-play').show();
    $playersPokemonDiv.append($('<div>').text(playersCurrentPokemon))
  };


}) //closing tag for page load function
