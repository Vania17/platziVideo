(async function load(){
  // fetch ('https://yts.mx/api/v2/list_movies.json?genres=action')
  //   .then (function (response){
    //     return response.json()
    //   })
    //   .then (function (user){
      //     console.log('user', user.data.movies)
      //   });
      async function getData(url){
        const response =  await fetch (url);
        const data = await response.json();
        if(data.data.movie_count>0){
          return data;
        }else{
          throw new Error('No se encontro ningun resultado');
        }

      }
      
      const BASE_API = 'https://yts.mx/api/v2/'; 
      
      async function cacheExist(category){
        const listName = `${category}List`;
        const cacheList = window.localStorage.getItem(listName);

        if(cacheList){
          return JSON.parse(cacheList);
        }
        const {data: {movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
        window.localStorage.setItem(listName, JSON.stringify(data));
        
        return data;
      }

  // const {data: {movies: actionList} } = await getData(`${BASE_API}list_movies.json?genre=action`);
  const actionList = await cacheExist('action');
  const dramaList = await cacheExist('drama');;
  const biographyList = await cacheExist('biography');;
  const animationList = await cacheExist('animation');;
  const musicList = await cacheExist('music');;
  const romanceList = await cacheExist('romance');;

  // localstorage
  window.localStorage.setItem('actionList', JSON.stringify(actionList));
  window.localStorage.setItem('dramaList', JSON.stringify(dramaList));
  window.localStorage.setItem('biographyList', JSON.stringify(biographyList));
  window.localStorage.setItem('animationList', JSON.stringify(animationList));
  window.localStorage.setItem('musicList', JSON.stringify(musicList));
  window.localStorage.setItem('romanceList', JSON.stringify(romanceList));

  // Contenedores
  const $actionContainer = document.getElementById('action');
  const $dramaContainer = document.getElementById('drama');
  const $animationContainer = document.getElementById('animation');
  const $biographyContainer = document.getElementById('biography');
  const $musicContainer = document.getElementById('music');
  const $romanceContainer = document.getElementById('romance');
  
  // 
  const $home = document.getElementById('home');
  
  // formulario
  const $featuringContainer = document.getElementById('featuring');
  
  // buscador
  const $form = document.getElementById('form');

  // modal
  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');
  
  const $modaltitle = $modal. querySelector('h1');
  const $modalImage = $modal. querySelector('img');
  const $modalDescription = $modal. querySelector('p');
  
  // Amigos lista
  const $userFriends = document.getElementById('playlistFriends');
  
  function videoItemTemplate(movie, category){
    return `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
      <div class="primaryPlaylistItem-image">
        <img src=${movie.medium_cover_image}>
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${movie.title}
      </h4>
    </div>`
  };

  function featuringTemplate(peli){
    return(
      `
      <div class="featuring">
      <div class="featuring-image">
        <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
      </div>
      <div class="featuring-content">
        <p class="featuring-title">Pelicula encontrada</p>
        <p class="featuring-album">${peli.title}</p>
      </div>
    </div>
      `
    )
  }

  function createTemplate(HTMLString){
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString; 
    return html.body.children[0];
  };

  function setAttributes(elem, attributes){
    for (const x in attributes){
      elem.setAttribute(x, attributes[x]);
    }
  }


  $form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    $home.classList.add('search-active');
    const $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    });
    $featuringContainer.append( $loader);

    const data = new FormData($form);

    try{
      const {data : { movies : pelis } } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
      const HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;  
    }catch(error){
      $loader.remove();
      $home.classList.remove('search-active');
      alert(error.message);
    }

  });
  
  function addEventClick($element){
    $element.addEventListener('click', ()=>{
      showModal($element);
    });
  }; 
  
  function findById(list, id){
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category){
    switch (category){
      case 'action': {
        return findById(actionList, id)
      }
      case 'drama':{
        return findById(dramaList, id)
      }
      case 'animation':{
        return findById(animationList, id)
      }
      case 'biography':{
        return findById(biographyList, id)
      }
      case 'music':{
        return findById(musicList, id)
      }
      default :{
        return findById(romanceList, id)
      }
    }
  }
  
  function showModal($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);
    $modaltitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
  }

 
  
  function hideModal(){
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .3s forwards';
  };
  
  function renderMovieList(list, $container, category){
    $container.children[0].remove();
    list.forEach((item)=>{
      const HTMLString = videoItemTemplate(item, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      addEventClick(movieElement);
    })
    
  };
  
  $hideModal.addEventListener('click', hideModal);
  
  renderMovieList(actionList, $actionContainer, 'action');
  renderMovieList(dramaList, $dramaContainer, 'drama');
  renderMovieList(animationList, $animationContainer, 'animation');
  renderMovieList(biographyList, $biographyContainer, 'biography');
  renderMovieList(musicList, $musicContainer, 'music');
  renderMovieList(romanceList, $romanceContainer, 'romance');

//  Parte DOS Amigos

// fetch ('https://randomuser.me/api/')
//     .then (function (response){
//       return response.json()
//     })
//     .then (function (user){
//       console.log('user', user.results[0].name)
//     }) 


async function getDataFriends(url){
  try{
    const response =  await fetch (url);
    const data = await response.json();
    return data;
    
  }catch(error){
    alert('No se encontro ningun resultado de amistades');
  }
}

async function cacheExistF(friend){
  const friendList = window.localStorage.getItem(friend);
  
  if(friendList){
    return JSON.parse(friendList);
  }
  const { results:friends } = await getDataFriends('https://randomuser.me/api/?results=22');
  window.localStorage.setItem(friend, JSON.stringify(friends));
  
  return friends;
}

const friends = await cacheExistF('Listfriends');
// window.localStorage.setItem('friends', JSON.stringify(friends)); //localStorage

const $playlistFriends = document.getElementById('playlistFriends');

function friendsItemTemplate(item){
  return (
    `<li class="playlistFriends-item" data-id="${item.id.value}">
      <a href="#">
        <img src="${item.picture.thumbnail}" alt="${item.name.first} ${item.name.last} avatar" />
        <span>
          ${item.name.first} ${item.name.last}
        </span>
      </a>
    </li>`
    )
  };

  function addEventClickF($element,item){
      $element.addEventListener('click', ()=>{
      showModalF(item);
      });
    }; 

  function showModalF($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    $modal.style.textAlign = "initial";
    
    $modaltitle.textContent = `${$element.name.first} ${$element.name.last}`;
    $modalImage.setAttribute('src', $element.picture.large);
    $modalDescription.innerHTML = ` 
      <strong>Age:</strong> ${$element.dob.age}<br>
      <strong>Gender:</strong> ${$element.gender}<br>
      <strong>Phone:</strong> ${$element.phone}<br>
      <strong>Location:</strong> ${$element.location.city}. ${$element.location.state}<br>
      <strong>Email:</strong> ${$element.email}`
  }

function renderFriendsList(list, $container){
    list.forEach((item)=>{
        const HTMLString = friendsItemTemplate(item);
        const friendElement = createTemplate(HTMLString);
        $container.append(friendElement);
        addEventClickF(friendElement,item);
    });
    if ($playlistFriends!=0){
      $container.children[0].remove();
    }
  }

renderFriendsList(friends, $playlistFriends);



})();