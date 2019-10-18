$(()=>{


  $('.pokemon-picker').on('click', (event)=> {
    console.log($(event.currentTarget).children('img').attr('id'));
    $.ajax ({
      url:'https://pokeapi.co/api/v2/pokemon/',
    }).then(
      (data)=> {
        console.log(data);
      }
    )
  })

})
