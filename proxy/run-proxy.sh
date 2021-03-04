#!/usr/bin/env bash

tempfile="$(mktemp).yaml"
sed_program='s/"/\\"/g'
eval "echo \"$(cat $(dirname $0)/envoy.yaml.in | sed $sed_program)\"" > $tempfile
envoy -c $tempfile
rm $tempfile
