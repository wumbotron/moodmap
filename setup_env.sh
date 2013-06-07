#!/usr/bin/env bash

virtualenv env
ln -sf "$PWD/env/bin/activate" env_activate
. env_activate
pip install Django
pip install psycopg2
pip install gunicorn
pip install dj-database-url
pip install requests
pip install requests_oauthlib
pip install python-dateutil
