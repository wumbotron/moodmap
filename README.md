To get started
=======
If you're on Debian/Ubuntu, you'll need to install some development libraries.
Run:

    sudo apt-get install libpq-dev python3-dev

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

Populate Data
======

    python manage.py shell

    >>> from maps.api_calls import update_model
    >>> update_model("hack4colorado")
