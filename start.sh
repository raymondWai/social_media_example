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

RUNNING_REDIS_CONTAINER=$(docker container ls|grep 'redis')
if [ -z "$RUNNING_REDIS_CONTAINER" ]
then
  REDIS_CONTAINER=$(docker container ls -a|grep 'redis')
  echo $REDIS_CONTAINER
  if [ -z "$REDIS_CONTAINER" ]
  then
    docker run --name speer-redis -d -p 6379:6379 redis
  else
    REDIS_CONTAINER=${REDIS_CONTAINER:0:12}
    docker container start $REDIS_CONTAINER
  fi
fi

nodemon index.js