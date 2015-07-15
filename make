#!/bin/bash
export NODE_ENV='development'
./gradlew clean shadowJar -Dairpal.useLocalNode
java -Duser.timezone=UTC \
         -cp build/libs/airpal-*-all.jar com.airbnb.airpal.AirpalApplication db migrate reference.yml
