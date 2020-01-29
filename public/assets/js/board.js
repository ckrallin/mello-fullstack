const $logoutButton = $('#logout');
const $boardContainer = $('.container');

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
  return $listContainers; //returns the array of lists
}

function renderBoard() {
  let $lists = createLists(board.lists);

  $boardContainer.empty();
  $boardContainer.append($lists);
}

$logoutButton.on('click', handleLogout);