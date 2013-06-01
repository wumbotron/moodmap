To get started
=======
Run the following commands to set up the virtualenv environment. You
should only need to do this once.

    cd moodmap/
    ./setup_env.sh

Then, whenever you want to activate the environment again (whenever you start
hacking on the project), type:

    . env_activate

To start the server, run:

    cd moodmap/ # This is the django subdirectory, *not* the root project dir
    python manage.py runserver 8080
