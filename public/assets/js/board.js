const $logoutButton = $('#logout');
const $boardContainer = $('.container');
const $boardName = $('header > h1');
const $createListInput = $('#create-list input');
const $saveListButton = $('#create-list .save');

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

function createLists(lists) {
  let $listContainers = lists.map(function(list) {    //runs through all the lists
    let $listContainer = $('<div class="list">'); //creates a div for each list
    let $header = $('<header>');    //creates a header
    let $headerButton = $('<button>').text(list.title); //creates a header button
    let $addCardButton = $('<button>Add a card...</button>');

    $header.append($headerButton);
    $listContainer.append($header);
    $listContainer.append($addCardButton);

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

$saveListButton.on('click', handleListCreate);
$logoutButton.on('click', handleLogout);