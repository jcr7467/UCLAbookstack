let express = require("express"),
    router  = express.Router();


router.get('/', (request, response) => {
    response.render('index', {
        title: "Home",
        navbar: "clear"
    });
});


module.exports = router;