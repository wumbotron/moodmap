#!/usr/bin/env bash

virtualenv env
ln -sf "$PWD/env/bin/activate" env_activate
. env_activate
pip install Django
