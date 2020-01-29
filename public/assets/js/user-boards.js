const $logoutButton = $('#logout');
const $newBoardButton = $('#new-board');
const $boardNameInput = $('#board-name');
const $saveBoardButton = $('#save-board');
const $boardsContainer = $('.boards');  

let user;

init();

function init() {
  user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    localStorage.clear();     //if no user is logged in takes you to homepage
    location.replace('/');
    return;
  }

  $('.welcome h1').text('Welcome ' + user.email + '!');

  getUserBoards();  //retrieve user boards to display
}

function getUserBoards() {        //sends an AJAX GET request to pull all the boards for the current user
  $.ajax({
    url: `api/users/${user.id}`,  
    method: 'GET'
  }).then(function(data) {
    renderBoards(data.boards);
  });
}

function renderBoards(boards) {
  $boardsContainer.empty()      //empties the .boards div

  let $boardTiles = boards.map(function(board) {  //loops over the boards array and calls the function for each
    let $boardTile = $('<a class="board-tile">')  //creates an anchor tag for each item in the array
      .attr('href', `/boards/${board.id}`)  //takes you to the appropriate HTTP address based on the board id
      .text(board.name);    //displats the board name

    return $boardTile;
  });

  $boardsContainer.append($boardTiles); //add all board tiles to the boards container
}

function handleBoardCreate(event) {
  event.preventDefault();
  
  let boardName = $boardNameInput.val().trim();

  $boardNameInput.val('');

  if (!boardName) {
    return;
  }

  $.ajax({            //sends ajax POST to create a new board
    url: '/api/boards',
    data: {
      name: boardName
    },
    method: 'POST'
  }).then(function() {
    getUserBoards();  //calls the function to get the most recent array of boards
    MicroModal.close('create-board'); //closes the modal
  });
}

function handleLogout() {
  $.ajax({
    url: '/logout',
    method: 'DELETE'
  }).then(function() {
    localStorage.clear();   //clears local storage to log out the user
    location.replace('/'); //takes you back to the home screen
  });
}

$logoutButton.on('click', handleLogout)
$newBoardButton.on('click', MicroModal.show.bind(null, 'create-board'));
$saveBoardButton.on('click', handleBoardCreate)