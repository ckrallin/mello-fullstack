const $logoutButton = $('#logout');
const $boardContainer = $('.container');
const $boardName = $('header > h1');
const $createListInput = $('#create-list input');
const $saveListButton = $('#create-list .save');
const $createCardInput = $('#create-card textarea');
const $saveCardButton = $('#create-card .save');

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
    location.replace('/boards');  ///redirect to boards page if there is an error
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

function createCards(cards){
  let $cardUl = $('<ul>');

  let $cardLis = cards.map(function(card) { //runs through the cards
    let $cardLi = $('<li>'); //adds a li for each card
    let $cardButton = $('<button>').text(card.text);

    $cardLi.append($cardButton); //adds the button to the card li item

    return $cardLi; //returns cards in the list
  });

  $cardUl.append($cardLis); //adds the cards to the unordered list

  return $cardUl;
}

function createLists(lists) {
  let $listContainers = lists.map(function(list) {    //runs through all the lists
    let $listContainer = $('<div class="list">').data('id', list.id); //creates a div for each list, sets data id to list id
    let $header = $('<header>');    //creates a header
    let $headerButton = $('<button>').text(list.title); //creates a header button
    let $cardUl = createCards(list.cards);
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

$saveCardButton.on('click', handleCardCreate);
$saveListButton.on('click', handleListCreate);
$logoutButton.on('click', handleLogout);