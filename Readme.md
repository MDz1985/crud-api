# CRUID API
___
## This is an implementation of the basic CRUID API.
___
### Installation
Use `npm i` or `npm install` to install all necessary packages
___
### Using
 - Use `npm run start:dev` to run application in development mode
 - Use `npm run start:prod` to run in production mod (that starts the build process and then runs the bundled file)
 - Use `npm run start:multi` to start multiple instances of this application

The application creates a server on http://localchost:4000 by default. You can change the port number in the .env file using PORT variable
### Requests
- GET http://localchost:4000/api/users/ (next time - api/users) - get the array of users from the server
- GET api/users/{userId} - get user with current id
- POST api/users body: `
{
  username: string,
  age:number,
  hobbies: string[]
}` - create new user
- DELETE api/users/{userId} - delete user with provided id
- PUT api/users/{userId} body: `
  {
  username: string,
  age:number,
  hobbies: string[]
  }` - update user with provided id


