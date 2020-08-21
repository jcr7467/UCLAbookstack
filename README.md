
UCLABookStack
==============
###### https://www.uclabookstack.com



Getting Started
----------------

#### First things first

##### You will need to install **_npm_** and **_nodejs_**. Check the **_package.json_** file to see which version to download.
##### E.g.     
##### "node": "12.16.3",
##### "npm": "6.14.5"

##### Find tutorial or Youtube video online on how to install **_npm_** and **_nodejs_**

#### Installing all dependencies
##### If you just cloned this project, you must have NodeJS and NPM installed beforehand, from the base of the repository, run:

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


