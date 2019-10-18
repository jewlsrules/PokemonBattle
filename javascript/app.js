$(()=>{


  $('#charmander').on('click', (event)=> {
    console.log($(event.currentTarget).attr('id'));
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/',
    }).then(
      (data)=> {
        console.log(data);
      }
    )
  })

})
