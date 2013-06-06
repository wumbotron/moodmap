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

Running the local server
========================

To create the database and start populating it with the daemon, run:

    cd moodmap/ # The django subdirectory, not the root directory
    python manage.py syncdb # This will create the DB with the correct schema
    python manage.py update_model start # This will start the data gathering daemon
    python manage.py runserver # Finally, start the server

New Dependencies
================

    pip install requests
    pip install requests_oauthlib