$(()=>{

  $.ajax ({
    url:'https://pokeapi.co/api/v2/pokemon/ditto',
  }).then(
    (data)=> {
      console.log(data);
    }
  )

})
