# Instalation

Inorder to run the app, You need docker installed on your computer first.

Once you installed docker on your computer, you could run `yarn install` to install the whole thing.

# Start app

`yarn start`

# Testing

`yarn test`

# Introduction

This project implemented basic user register, login, authenticate and post CRUD with enriched user intereaction.\
User could post unlimited length text post while they could also like, comment, retweet or quote other's post with their own option on it.\
Since every comment is itself a post, we could also like, comment, retweet or quote other's comment.\
Beside it, user could send private message to other user once they become friends.\
To avoid some stranger add you to be his/her friend, they could only be your friend only if you accept their friend request.

To enforce security, this project used jwt with rsa 2046 to authticate user.
Also, only the hashed password is stored on the database.

Websocket is also used to implement the chat function such that the user will be notified immediately when they have new message.
