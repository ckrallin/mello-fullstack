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

  authenticateUser(email, password); //sends the information via AJAX
}

function displayMessage(message, type) {
  $message.text(message).attr('class', type);
}

function handleSignupResponse(status) {
  if (status === 'success') {
    displayMessage('Registered successfully! You may now sign in.', 'success');
    setAuth('login');
  } else {
    displayMessage(
      'Somethin went wrong. A user with this account may already exits.', 'danger'
    );
  }
}

function handleLoginResponse(data, status, jqXHR) {
  if (status === 'success') {
    let jwt = jqXHR.getResponseHeader('authorization'); //if success returns the JSON web token
    let user = JSON.stringify(data);        //turn user info into string

    localStorage.setItem('authorization', jwt); //setting authorization key to jwt via local storage
    localStorage.setItem('user', user);
  } else {
    displayMesssage('Invalid email or password', 'danger');
  }
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
  }).then(function(data, status, jqXHR) {
    if (authSetting === 'signup') {
      handleSignupResponse(status);
    } else {
      handleLoginResponse(data, status, jqXHR);
    }
  })
  .catch(function(err) {
    if (authSetting === 'signup') {
      handleSignupResponse(err.statusText);
    } else {
      handleLoginResponse(err.statusText);
    }  
  });
}

$setLogin.on('click', setAuth.bind(null, 'login'));
$setSignUp.on('click', setAuth.bind(null, 'signup'));
$submitButton.on('click', handleFormSubmit)