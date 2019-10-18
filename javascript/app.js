$(()=>{


  $('.pokemon-picker').on('click', (event)=> {
    let $pokemonName = $(event.currentTarget).children('img').attr('id')
    let $pokemonModal = $(event.currentTarget).children('div')
    $pokemonModal.toggle();
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+$pokemonName,
    }).then(
      (data)=> {
        console.log("This Pokemon's type is: "+ data.name);
        console.log("This Pokemon has " + data.base_experience + " XP");
      }
    )
  })

})
