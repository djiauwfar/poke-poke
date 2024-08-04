$(document).ready(function() {
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
  const limit = 20; // Number of Pokémon to fetch per request
  let offset = 0; // Offset to start fetching Pokémon
  let loading = false; // Flag to prevent multiple fetches

  let pokemonList = [];

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Function to fetch and display the list of Pokémon
  function fetchPokemonList() {
    if (loading) return; // Prevent multiple fetches

    loading = true;
    $.get(`${apiUrl}?limit=${limit}&offset=${offset}`, function(data) {
      const pokemonUrls = data.results.map(pokemon => pokemon.url);
      const pokemonRequests = pokemonUrls.map(url => $.get(url));

      Promise.all(pokemonRequests).then(pokemonData => {
        pokemonData.forEach(pokemon => {
          const capitalizedPokemonName = capitalizeFirstLetter(pokemon.name);

          pokemonList.push({
            id: pokemon.id,
            name: capitalizedPokemonName,
            image: pokemon.sprites.front_default,
            details: `
              <p><strong>Height:</strong> ${pokemon.height}</p>
              <p><strong>Weight:</strong> ${pokemon.weight}</p>
              <p><strong>Types:</strong> ${pokemon.types.map(typeInfo => capitalizeFirstLetter(typeInfo.type.name)).join(', ')}</p>
              <p><strong>Abilities:</strong> ${pokemon.abilities.map(abilityInfo => capitalizeFirstLetter(abilityInfo.ability.name)).join(', ')}</p>
            `
          });

          $('#pokemon-list').append(`
            <li class="nav-item">
              <a class="nav-link" href="#" data-id="${pokemon.id}">
                <img src="${pokemon.sprites.front_default}" alt="${capitalizedPokemonName} icon" />
                <span>${capitalizedPokemonName}</span>
              </a>
            </li>
          `);
        });

        offset += limit; // Update offset for next fetch
        loading = false;
      });
    });
  }

  function showPokemonDetails(pokemon) {
    if (pokemon) {
      $('#pokemon-name').text(pokemon.name);
      $('#pokemon-image').attr('src', pokemon.image);
      $('#pokemon-details').html(pokemon.details);
      $('#pokemon-details').show();
      $('#pokemon-image-container').show();
      $('.video-container').hide();
    } else {
      $('#pokemon-name').text('Choose Pokemon');
      $('#pokemon-image').attr('src', '');
      $('#pokemon-details').empty();
      $('#pokemon-details').hide();
      $('#pokemon-image-container').hide();
      $('.video-container').show();
    }
  }

  // Initial fetch
  fetchPokemonList();

  $('#pokemon-list').on('click', '.nav-link', function(event) {
    event.preventDefault();
    const pokemonId = $(this).data('id');
    const pokemon = pokemonList.find(p => p.id === pokemonId);
    showPokemonDetails(pokemon);
  });

  // Toggle sidebar visibility
  $('.sidebar-toggle').click(function() {
    $('#sidebar').toggleClass('collapsed');
    $('.main-content').toggleClass('expanded');
  });

  // Handle contact form submission
  $('#contact-form').submit(function(event) {
    event.preventDefault();

    const name = $('#name').val();
    const phone = $('#phone').val();
    const message = `Name: ${name}%0APhone: ${phone}%0AThis is a message from the Pokédex website.`;

    // Open WhatsApp with the message
    const whatsappUrl = `https://api.whatsapp.com/send?phone=+6287883532545&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Close the modal
    $('#contactModal').modal('hide');

    // Clear the form
    $(this).trigger('reset');
  });

  // Show home screen video initially
  showPokemonDetails(null);

  // Infinite scrolling
  $('#sidebar').on('scroll', function() {
    if (!loading && $(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
      fetchPokemonList();
    }
  });
});
