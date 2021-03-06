const $logoutButton = $('#logout');
const $boardContainer = $('.container');
const $boardName = $('header > h1');
const $createListInput = $('#create-list input');
const $saveListButton = $('#create-list .save');
const $createCardInput = $('#create-card textarea');
const $saveCardButton = $('#create-card .save');
const $editListInput = $('#edit-list input');
const $editListSaveButton = $('#edit-list .save');
const $editListDeleteButton = $('#edit-list .delete');
const $editCardInput = $('#edit-card textarea');
const $editCardSaveButton = $('#edit-card .save');
const $editCardDeleteButton = $('#edit-card .delete');
const $contributorModalButton = $('#contributors');
const $contributorModalInput = $('#contributor-email');
const $contributorModalSaveButton = $('#contribute .save');
const $contributorModalList = $('#contributors-content ul');

let board; //creating global variable to hold the board object

init();

function init() {
  let boardID = location.pathname.split('/')[2]; //gets the board id by referencing the path
  getBoard(boardID);
}

function getBoard(id) {
  $.ajax({
    url: `/api/boards/${id}`,
    method: 'GET'
  })
  .then(function(data) {
    board = data;         //assigning board variable to the value of data
    renderBoard();
  })
  .catch(function(err) {
    if (err.statusText === 'Unauthorized') {
      location.replace('/boards');  ///redirect to boards page if there is an error
    }
  });
}

function handleLogout() {
  $.ajax({
    url: '/logout',
    method: 'DELETE'
  }).then(function() {
    localStorage.clear();
    location.replace('/');
  });
}

function createCards(list){
  let $cardUl = $('<ul>');

  let $cardLis = list.cards.map(function(card) { //runs through the cards
    let $cardLi = $('<li>'); //adds a li for each card
    let $cardButton = $('<button>')
      .text(card.text)
      .data({...card, list_id: list.id}) //...spreads the function
      .on('click', openCardEditModal);    //associating card data with the card button

    $cardLi.append($cardButton); //adds the button to the card li item

    return $cardLi; //returns cards in the list
  });

  $cardUl.append($cardLis); //adds the cards to the unordered list

  return $cardUl;
}

function createLists(lists) {
  let $listContainers = lists.map(function(list) {    //runs through all the lists
    let $listContainer = $('<div class="list">').data(list); //creates a div for each list, sets data to the list element
    let $header = $('<header>');    //creates a header
    let $headerButton = $('<button>')
      .text(list.title) //creates a header button
      .data(list)       //store entire list object to be used later
      .on('click', openListEditModal);
    let $cardUl = createCards(list);
    let $addCardButton = $('<button>Add a card...</button>').on(
      'click',
      openCardCreateModal
      );

    $header.append($headerButton);
    $listContainer.append($header);
    $listContainer.append($cardUl); //lists the cards
    $listContainer.append($addCardButton); //puts add card button at end of list of cards

    return $listContainer; 
  });

  let $addListContainer = $('<div class="list add">');
  let $addListButton = $('<button>')
    .text('+ Add another list')
    .on('click', openListCreateModal);

  $addListContainer.append($addListButton);
  $listContainers.push($addListContainer);  //adds the add list button to the array

  return $listContainers; //returns the array of lists
}

function renderBoard() {
  let $lists = createLists(board.lists);

  $boardName.text(board.name);

  $boardContainer.empty();
  $boardContainer.append($lists);

  makeSortable();
  renderContributors();
}

function renderContributors() {
  let $contributorListItems = board.users.map(function(user) {
    let $contributorListItem = $('<li>');
    let $contributorSpan = $('<span>').text(user.email);
    let $contributorDeleteButton = $('<button class="danger">Remove</button>')
      .data(user)
      .on('click', handleContributorDelete);

    $contributorListItem.append($contributorSpan, $contributorDeleteButton);

    return $contributorListItem;
  });

  $contributorModalList.empty();
  $contributorModalList.append($contributorListItems);
}

function makeSortable() {
  Sortable.create($boardContainer[0], {       //gives us reference to the .container element
    animation: 150,
    ghostClass: 'ghost',
    filter: '.add',       //elements that match the .add selector shouldnt be draggable
    easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.85)',
    onMove: function(event) {
      let shouldMove = !$(event.related).hasClass('add'); //boolean for should move if it has the class add returns false
      return shouldMove;
    },
    onEnd: function(event) {          //called at the end of drag and drop
      let { id, position } = $(event.item).data();
      let newPosition = event.newIndex + 1;

      if (position === newPosition) {
        return;
      }
      $.ajax({
        url: `/api/lists/${id}`,
        data: {
          position: newPosition
        },
        method: 'PUT'
      }).then(function(){
        init();
      });
    }
  });

  $('.list > ul').each(function(index, element) {
    Sortable.create(element, {
      animation: 150,
      ghostClass: 'ghost',
      easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      group: 'shared',         ///allows us to pass between lists
      onEnd: function(event) {
        let { id, position, list_id } = $(event.item)
          .find('button')       //getting any child of the li that is a button and returning the data method.
          .data();
        let newPosition = event.newIndex + 1;
        let newListId = $(event.item)
          .parents('.list')
          .data('id');

        if (position === newPosition && list_id === newListId) {
          return;
        }

        $.ajax({
          url: `/api/cards/${id}`,
          method: 'PUT',
          data: {
            list_id: newListId,
            position: newPosition
          }
        }).then(function() {
          init();
        });
      }
    });
  });  
}

function openListCreateModal() {
  $createListInput.val('');
  MicroModal.show('create-list');
}

function handleListCreate(event) {
  event.preventDefault();

  let listTitle = $createListInput.val().trim();

  if(!listTitle) {
    MicroModal.close('create-list');
    return;
  }

  $.ajax({
    url: '/api/lists',
    method: 'POST',
    data: {
      board_id: board.id,
      title: listTitle
    }
  }).then(function() {
    init();
    MicroModal.close('create-list');
  });
}

function openCardCreateModal(event) {
  let $listContainer = $(event.target).parents('.list'); //search DOM for a parent element of the button that has the class of list
  let listId = $listContainer.data('id'); //uses the fata id in the container to assign list id

  $saveCardButton.data('id', listId); //allows us to acces the listId whenever the create-card save button is clicked

  $createCardInput.val('');
  MicroModal.show('create-card');
}

function handleCardCreate(event) {
  event.preventDefault();

  let listId = $(event.target).data('id');
  let cardText = $createCardInput.val().trim();

  if(!cardText) {
    MicroModal.close('create-list');
    return;
  }

  $.ajax({
    url: '/api/cards',
    method: 'POST',
    data : {
      list_id: listId,
      text: cardText
    }
  }).then(function() {
    init();
    MicroModal.close('create-card');
  });
}

function openListEditModal(event) {
  let listData = $(event.target).data(); //turns the native DOM element into a jQuery event, grabs the data for us to manipulate
  
  $editListInput.val(listData.title); //populate current list title into input
  $editListSaveButton.data(listData); //allows us to access the data through the event.target in handleListEdit
  $editListDeleteButton.data(listData);

  MicroModal.show('edit-list');
}

function handleListEdit() {
  event.preventDefault();

  let { title, id } = $(event.target).data(); //destructuring allows us to take title and id from the current list to define those variables
  let newTitle =$editListInput.val().trim();

  if(!newTitle || newTitle === title) {
    MicroModal.close('edit-list');
    return;
  }

  $.ajax({
    url: `/api/lists/${id}`,
    method: 'PUT',
    data: {
      title: newTitle
    }
  }).then(function() {
    init();
    MicroModal.close('edit-list');
  });
}

function handleListDelete() {
  event.preventDefault();

  let { id } = $(event.target).data();

  $.ajax({
    url: `/api/lists/${id}`,
    method: 'DELETE'
  }).then(function() {
    init();
    MicroModal.close('edit-list')
  });
}

function openCardEditModal(event) {
  let cardData = $(event.target).data();

  $editCardInput.val(cardData.text);
  $editCardSaveButton.data(cardData);
  $editCardDeleteButton.data(cardData);

  MicroModal.show('edit-card');
}

function handleCardSave(event) {
  event.preventDefault();

  let { text, id } = $(event.target).data();
  let newText = $editCardInput.val().trim();

  if (!newText || newText === text) {
    MicroModal.close('edit-card');
    return;
  }

  $.ajax({
    url: `/api/cards/${id}`,
    method: 'PUT',
    data: {
      text: newText
    }
  }).then(function() {
    init();
    MicroModal.close('edit-card');
  });
}

function handleCardDelete(event) {
  event.preventDefault();

  let { id } = $(event.target).data();

  $.ajax({
    url: `/api/cards/${id}`,
    method: 'DELETE',
  }).then(function() {
    init();
    MicroModal.close('edit-card');
  });
}

function handleContributorSave(event) {
  event.preventDefault();

  let emailRegex = /.+@.+\..+/;     ///makes sure its a regular email address

  let contributorEmail = $contributorModalInput
    .val()
    .trim()
    .toLowerCase();

  $contributorModalInput.val('');

  if (!emailRegex.test(contributorEmail)) {   //tests that it is a regular expression
    displayMessage(`Must provide a valid email address`, 'danger');
    return;
  }

  let contributor = board.users.find(function(user) {   //search for the user
    return user.email === contributorEmail;
  });

  if (contributor) {
    displayMessage(
      `${contributorEmail} already has access to the board`, 
      'danger'
    );  //if the user already exists prompt this
    return;
  }

  $.ajax({
    url: '/api/user_boards',
    method: 'POST',
    data : {
      email: contributorEmail,
      board_id: board.id
    }
  }).then(function() {
    init();
    displayMessage(
      `Successfully added ${contributorEmail} to the board`,
      success
    );
  })
  .catch(function() {
    displayMessage(
      `Cannot find user with email: ${contributorEmail}`,
      'danger' 
    );
  });
}

function openContributorModal() {
  $contributorModalInput.val('');
  displayMessage('');

  MicroModal.show('contribute');
}

function handleContributorDelete(event) {
  let { id, email } = $(event.target).data();

  $.ajax({
    url: '/api/user_boards',
    method: 'DELETE',
    data : {
      user_id: id,
      board_id: board.id
    }
  }).then(function(){
    init();
    displayMessage(`Successfully removed user: ${email}`, 'success');
  });
}

function displayMessage(msg, type = 'hidden') {
  $('#contribute .message')
    .attr('class', `message ${type}`)
    .text(msg);
}

$contributorModalSaveButton.on('click', handleContributorSave);
$contributorModalButton.on('click', openContributorModal);
$saveCardButton.on('click', handleCardCreate);
$saveListButton.on('click', handleListCreate);
$logoutButton.on('click', handleLogout);
$editListSaveButton.on('click', handleListEdit);
$editListDeleteButton.on('click', handleListDelete);
$editCardSaveButton.on('click', handleCardSave);
$editCardDeleteButton.on('click', handleCardDelete);