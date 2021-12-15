const UserController = require('../controllers/UserController');
const express = require('express');

/**
 * @swagger
 *  components:
 *      schemas:
 *          User:
 *              type: object
 *              required:
 *                  - username
 *                  - password
 *                  - firstName
 *                  - email
 *              properties:
 *                  username:
 *                      type: string
 *                      description: Unique login name of user
 *                  password:
 *                      type: string
 *                      description: Password of user
 *                  firstName:
 *                      type: string
 *                      description: First name of user
 *                  lastName:
 *                      type: string
 *                      description: Last name of user
 *                  email:
 *                      type: string
 *                      description: email of user
 *                  bio:
 *                      type: string
 *                      description: bio of user
 *                  iconURL:
 *                      type: string
 *                      description: url of user icon
 *              example:
 *                  username: testUser1,
 *                  password: zTSB|2Sm&5lgF*,
 *                  firstName: Robert,
 *                  lastName: Smith,
 *                  email: robertsmith@email.com,
 *                  bio: I am Robert Smith,
 *                  iconURL: http://example.org/img/icon.png
 *          UserResponse:
 *              type: object
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: Generated ID of user
 *                  username:
 *                      type: string
 *                      description: Unique login name of user
 *                  password:
 *                      type: string
 *                      description: Password of user
 *                  firstName:
 *                      type: string
 *                      description: First name of user
 *                  lastName:
 *                      type: string
 *                      description: Last name of user
 *                  email:
 *                      type: string
 *                      description: email of user
 *                  bio:
 *                      type: string
 *                      description: bio of user
 *                  iconURL:
 *                      type: string
 *                      description: url of user icon
 *          ErrorResponse:
 *              type: object
 *              properties:
 *                  message:
 *                      type: string
 *                      description: error message
 *          LoginParam:
 *              type: object
 *              required:
 *                  - username
 *                  - password
 *              properties:
 *                  username:
 *                      type: string
 *                      description: username of the user
 *                  password:
 *                      type: string
 *                      description: password of the user
 */
const router = express.Router();

/**
 *  @swagger
 *  tags:
 *      name: Users
 *      description: API to register and login.
 */

/**
 * @swagger
 *   /users:
 *          post:
 *              summary: Register a user
 *              tags: [Users]
 *              requestBody:
 *                  required: true
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/User'
 *              responses:
 *                  "200":
 *                      description: Return _id of registrated user
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  $ref: '#/components/schemas/UserResponse'
 *                  "409":
 *                      description: Return error message
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  $ref: '#/components/schemas/ErrorResponse'
 *                              examples:
 *                                  duplicate_user:
 *                                      value:
 *                                          message: 'duplicate_user'
 *                                  server_error:
 *                                      value:
 *                                          message: 'server_error'
 */
router.post('/', UserController.signup);

/**
 * @swagger
 *   /users/login:
 *          post:
 *              summary: User login
 *              tags: [Users]
 *              requestBody:
 *                  required: true
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/LoginParam'
 *              responses:
 *                  "200":
 *                      description: Return _id of registrated user
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  $ref: '#/components/schemas/UserResponse'
 *                  "409":
 *                      description: Return error message
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  $ref: '#/components/schemas/ErrorResponse'
 *                              examples:
 *                                  duplicate_user:
 *                                      value:
 *                                          message: 'duplicate_user'
 *                                  server_error:
 *                                      value:
 *                                          message: 'server_error'
 */
router.post('/login', UserController.login);

module.exports = router;
