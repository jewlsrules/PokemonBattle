$(()=>{

  let $pokemonModal = $('.modal')

  //click function for choosing your pokemon
  $('.pokemon-picker').on('click', (event)=> {
    let $pokemonName = $(event.currentTarget).children('img').attr('id')
    let $pokemonModal = $('.modal');

    //toggle seeing the pokemon's information or not.
    $pokemonModal.toggle();

    //api pull to get pokemon information for only the pokemon that was clicked
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+$pokemonName,
    }).then(
      (data)=> {
        let $pokemonName = data.name
        let $pokemonXP = data.base_experience
        console.log("This Pokemon's type is: "+ $pokemonName);
        console.log("This Pokemon has " + $pokemonXP + " XP");

        $('.poke-type').text($pokemonName)
        $('.poke-xp').text($pokemonXP)
      }
    )

  }) //closing tag for click function

})
