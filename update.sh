#!/bin/bash

# Run git pull
git pull

# Run docker-compose up
docker-compose up -d --build
