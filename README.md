
UCLABookStack
==============
###### https://www.uclabookstack.com



Getting Started
----------------

#### First things first

###### You will need to install **_npm_** (node package manager) and **_nodejs_**. Check the **_package.json_** file to see which version to download.
###### E.g.    
###### ...
###### engines: { 
###### "node": "12.16.3",
###### "npm": "6.14.5"
###### }
###### ...

###### Go to https://nodejs.org/en/download/ and download the version specified in **_package.json_** to install both NodeJS and npm
###### I would suggest finding a tutorial or Youtube video online on how to install **_npm_** and **_nodejs_** to see a visual example


#### Checking If You Already Have NodeJS and npm
###### Confirm that NodeJS and npm were installed correctly with the correct version by running:
##### node -v
##### npm -v


#### Installing all dependencies
###### If you just cloned this project, you must have NodeJS and NPM installed beforehand, from the base of the repository, run:

##### **_npm install_**


Getting the required environmental variables
--------------------------------------------
##### The last step is getting the required environmental variables
##### Without them, the application won't work fully.
#### **Ask me for these variables and I will send you the file**

Accessing Database
-----------------
#####I will also have to whitelist your IP address on the MongoDB database in order for you to access it, this is moreso a reminder for me

Running Development Server
---------------------------
###### Once you have installed all the packages necessary, nodemon will automatically restart server any time changes are made to the files (super convenient)
###### Run
##### **_npm run dev-server_** 
###### Type **_localhost:8000_** into your browser
###### If this port changes (currently set at 8000), you can see it at the top of app.js


When making changes to CSS/SCSS
-------------------------------
###### In order to make changes, **_always_** make them to scss and compile it into css. To compile scss to css, run:

##### **_npm run compile-scss_**



Adding new packages with **_NPM_**
-----------------------------------
###### For the purpose of this project, say we want to install a new module (e.g. express)
###### Always pass in **_--save-exact_** flag in order for modules to not auto update to newer version and risk breaking stuff
###### If the package/module just makes development easier but not necessarily needed to host the application, (like **_nodemon_**) then pass in **_--save-dev_** flag
###### https://www.youtube.com/watch?v=rv2xcy0u3y8 <- watch this to understand npm versioning


##### **_npm install --save-exact express_**
##### **_npm install --save-exact --save-dev nodemon_**

###### We can check that we saved exact version by verifying that a caret '^' is not next to the version
###### **_Good_**:    "express": "4.17.1"   Will not update automatically
###### **_Bad_**:    "express": "^4.17.1"   Will update automatically, happens by default if we pass in only **_--save_** flag

Removing packages with **_NPM_**
-----------------------------------
###### The same as installing but with **_uninstall_** keyword
##### **_npm uninstall --save-exact express_**
##### **_npm uninstall --save-exact --save-dev nodemon_**


Making Pull Requests
----------------------

##### When making a pull request, always make them to **_review-branch_**.
##### This gives me a chance to review the changes and run them on my end before merging them into the production version (master)








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
|                   included in the github repo, but running 'npm install' 
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


