function ValidateConfirmPassword() {
    let password = document.getElementById("pw").value;
    let confirmPassword = document.getElementById("pw_confirm").value;
    if (password != confirmPassword) {
        document.getElementById("pwConfirmErrMsg").style.color="Red";
        document.getElementById("pwConfirmErrMsg").innerHTML="Passwords do not match";
        return false;
    }
    document.getElementById("pwConfirmErrMsg").innerHTML=""
    createToken();
    return true;
}

function createToken() {
    grecaptcha.ready(function() {
        // do request for recaptcha token
        // response is promise with passed token
        grecaptcha.execute('6LfETdwZAAAAAPCzh2iifnUayMlq_04G7Y1JkrD4')
        .then(function(token) {
            // add token value to form
            document.getElementById("g-recaptcha").value = token;
        });
    });
}