#!/usr/bin/env bash

base_commands="cd $PWD;"

ttab "$base_commands"
ttab "$base_commands""cd src/pi; go get; go build; chmod +x pi; ./pi"
ttab "$base_commands""npm install; npm start"

#TODO rename the tabs appropriately?
