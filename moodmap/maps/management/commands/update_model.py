from django.core.management.base import BaseCommand, CommandError
from api_calls import update_model
from time import sleep

class Command(BaseCommand):

    def handle(self, *args, **options):
        while(True):
            update_model("hack4colorado")
            sleep(60 * 5)