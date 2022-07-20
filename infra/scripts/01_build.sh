#!/bin/bash

##################
### Apps Setup ###
##################

### Set parameters

#############
### Build ###
#############

# Proxy
mvn clean package \
  -f "../../apps/proxy/pom.xml"
