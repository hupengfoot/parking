#!/bin/bash

cat $1 |grep 'search community name is ' | awk '{print $13}'
