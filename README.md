
UCLABookStack
==============
###### https://www.uclabookstack.com



Getting Started
----------------

#### First things first

###### You will need to install **_npm_** and **_nodejs_**. Check the **_package.json_** file to see which version to download.
###### E.g.     
###### "node": "12.16.3",
###### "npm": "6.14.5"

###### Find tutorial or Youtube video online on how to install **_npm_** and **_nodejs_**

#### Installing all dependencies
###### If you just cloned this project, you must have NodeJS and NPM installed beforehand, from the base of the repository, run:

##### **_npm install_**


Running Development Server
---------------------------
###### Once you have installed all the packages necessary, nodemon will automatically restart server any time changes are made to the files (super convenient) 
###### Type **_localhost:8000_** into your browser
###### If this port changes(8000), you can see it at the top of app.js
###### Run

##### **_npm run dev-server_**

When making changes to CSS/SCSS
-------------------------------
###### In order to make changes, **_always_** make them to scss and compile it into css. To compile scss to css, run:

##### **_npm run compile-scss_**



Adding new packages with **_NPM_**
-----------------------------------
###### For the purpose of this project, say we want to install a new module (e.g. express)
###### Always pass in **_--save-exact_** flag in order for modules to not auto update to newer version and risk breaking stuff
###### If the package/module just makes developement easier (like **_nodemon_**) then pass in **_--save-dev_** flag


##### **_npm install --save-exact express_**
##### **_npm install --save-exact --save-dev nodemon_**

###### We can check that we saved exact version by verifying that a carret '^' is not next to the version
###### **_Good_**:    "express": "4.17.1"   Will not update automatically
###### **_Bad_**:    "express": "^4.17.1"   Will update automatically, happens by default if we pass in only **_--save_** flag

Removing packages with **_NPM_**
-----------------------------------
###### The same as installing but with **_uninstall_** keyword
##### **_npm uninstall --save-exact express_**
##### **_npm uninstall --save-exact --save-dev nodemon_**











Technologies Used
-----------------

### Front-End

##### HTML 
##### SCSS
##### CSS
##### Handlebars Templating Engine

### Back-End

##### NodeJS
##### Express

### Services

##### MongoDB (To host our database)
##### Amazon Web Services (To store user image uploads)
##### Heroku (To host our application)






File Structure
---------------
```
source
|
└─── README.md - Documentation
|
└─── package.json - File full of dependencies and scripts to manage our project
│    
|
└─── app.js - Driving file that ties everything together
│           - This file calls all routing files, supports the messagin through sockets,
|             and configures app details. Connects to database
└─── Procfile - Just a file Heroku needs in order to host our website online
|
└─── .env - Where we set our environmental variables
|
|
└─── views -Contains all the Handlebars templates that are rendered into HTML
│   │   
|   └───layouts - If when rendering, no outline is specified, it defaults to layout.hbs
|   |      └─── ...
│   │   
|   └─── partials
│   │
│   └─── bookformtips.hbs
|   |
|   └─── ...    
│       
|
└─── util - Used for miscellaneous pages that are mainly used as tools
│      │
|      └───   handlebar_helpers.js - Used to create custom helper functions used in handlebars templates
|      |                           - Handlebar helper functions typically must return boolean value
│      │   
|      └─── ...
|
|
└─── routes - These are the routes that handle the url requests of the user (both post and get requests)
│      │
|      └─── account_routes.js - Routes that are used for user account actions. E.g. sign up, sign in, create account, etc.
|      |                        
│      │   
|      └─── message_routes.js - Routes that handle the messaging feature of BookStack.
|      |
|      |
|      └─── profile_routes.js - Routes that handle profile actions, like uploading book, updating settings, delete books, etc.
│      |  
|      |
|      └─── routes.js - Routes that are mostly static, where we just serve a html page 
|                       with no data from database, and miscellanous pages as well that didnt fit in files above.
|
└─── public - This directory is what html pages can see. E.g. 
|      |      if we access /js/client.js or /css/chat.css, they will refer to the ones in public
│      │
|      └─── ...
|      |                        
│      │   
|      └─── ...
|
|
└─── node_modules - This is all the dependencies, this is the largest part of the project, so they are not
|                   included in the github, but running 'npm install' 
|                   from the base directory will install all dependencies and create this directory
|
|
└─── models - This directory stores all the objects that will be stored in the database is what html pages can see. E.g. 
|      |      
│      │
|      |                        
|      └─── book.js - book object that has the traits that will be stored in db
|      |                        
│      │   
|      └─── user.js- user object that has the traits that will be stored in db
|      |                        
│      │   
|      └─── conversation.js- conversation object that has the traits that will be stored in db, with all messages
|
|
|
└─── middleware - This directory stores all the middleware functions that can be called during a route.
|      |          E.g. we would use a middleware function to make sure that a user
|      |          is logged in/out before accessing page, etc. 
│      │
|      |                        
|      └─── middleware.js - Declarations of middleware functions used in routes
|
|
|
└─── .lambda_functions - This directory is just a backup of the lambda functions that are used on AWS
       |      
       │
       |                        
       └─── ...
       |                        
       │   
       └─── ...
       |                        
       │   
       └─── ...


```


