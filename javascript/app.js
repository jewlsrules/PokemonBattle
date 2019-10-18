$(()=>{

  const $choosePokemon = $('.choose-pokemon')
  let $clickToPick = $('.click-to-pick')
  let playersPokemon

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
    //confirm that that's the pokemon they want to pick
    let result = confirm('Are you sure you want to pick '+$pokemonName+"?")
    //if the player confirms, hide the pokemon selector and move on to the game
    if(result){
      $choosePokemon.hide();
      //change the player's pokemon to the one that was chosen.
      playersPokemon = $pokemonName
      console.log(playersPokemon);
    }
  })



})
