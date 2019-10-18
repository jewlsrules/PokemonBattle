$(()=>{


  $('.pokemon-picker').on('click', (event)=> {
    let $pokemonName = $(event.currentTarget).children('img').attr('id')
    console.log($pokemonName);
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/'+$pokemonName,
    }).then(
      (data)=> {
        console.log(data);
      }
    )
  })

})
