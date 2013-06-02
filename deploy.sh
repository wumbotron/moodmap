#!/usr/bin/env bash

./setup_env.sh
. env_activate
cd moodmap
python manage.py syncdb
python manage.py update_model start
python manage.py run_gunicorn
