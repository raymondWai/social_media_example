#! /bin/bash                                                                    
RUNNING_CONTAINER=$(docker container ls|grep 'mongo')
if [ -z "$RUNNING_CONTAINER" ]
then
  CONTAINER=$(docker container ls -a|grep 'mongo')
  if [ -z "$CONTAINER" ]
  then
    docker run --name mongodb -d -p 27017:27017 mongo
  else
    CONTAINER=${CONTAINER:0:12}
    docker container start $CONTAINER
  fi
fi

nodemon index.js