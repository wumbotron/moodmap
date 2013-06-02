from django.core.management.base import BaseCommand, CommandError
from maps.api_calls import update_model
from time import sleep

import os
import os.path
import signal
import time

class Command(BaseCommand):
    args = "[start|stop] <query string>"
    help = "Starts a service which periodically updates the model"

    LOCK_FILE = '.start_stop_lock'
    QUERY = 'hack4colorado'

    def start_service(self):
        if os.path.isfile(Command.LOCK_FILE):
            print "Daemon is already running. Exiting."

        else:
            pid = os.fork()
            if pid == 0: # Child process
                self.run_daemon()
            else:
                with open(Command.LOCK_FILE, 'w') as f:
                    f.write(str(pid))

    def stop_service(self):
        try:
            with open(Command.LOCK_FILE, 'r') as f:
                pid = int(f.readline())
                os.kill(pid, signal.SIGINT)
                os.unlink(Command.LOCK_FILE)
        except IOError:
            print "Daemon is not running. Exiting."

    def run_daemon(self):
        while True:
            update_model(Command.QUERY)
            time.sleep(120)

    def handle(self, *args, **options):
        if args[0] == "start":
            self.start_service()
        elif args[0] == "stop":
            self.stop_service()
        else:
            print "Unrecognized command: %s" % (args[0],)

