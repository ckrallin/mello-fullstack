const $setLogin = $('#login');
const $setSignUp = $('#signup');
const $submitButton = $('#submit');
const $emailInput = $('#email');
const $passwordInput = $('#password');
const $message = $('#message');

let authSetting = 'login';

function setAuth(setting) {   //function to toggle login/signup buttons
  authSetting = setting;
  if (authSetting === 'login') {
    $setLogin.addClass('active');
    $setSignUp.removeClass('active');
    $submitButton.text('Log In');
  } else {
    $setSignUp.addClass('active');
    $setLogin.removeClass('active');
    $submitButton.text('Sign Up');
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  let email = $emailInput.val().trim();
  let password = $passwordInput.val().trim();

  if (!email || !password) {
    displayMessage('Email and password fields cannot be blank.', 'danger'); //returns error if either field is blank
    return;
  }

  $emailInput.val('');
  $passwordInput.val('');

  authenticateUser(email, password);
}

function displayMessage(message, type) {
  $message.text(message).attr('class', type);
}

function authenticateUser(email, password) {
  $.ajax({
    url: '/' + authSetting, //directs the path based on the authSetting
    data: {
      user: {
        email,
        password
      }
    },
    method: 'POST'
  }).then(function(data) {
    console.log(data);
  });
}

$setLogin.on('click', setAuth.bind(null, 'login'));
$setSignUp.on('click', setAuth.bind(null, 'signup'));
$submitButton.on('click', handleFormSubmit)