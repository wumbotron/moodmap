from django.http import HttpResponse
from django.template.loader import render_to_string

def index(request):
    """Returns a default view"""
    return HttpResponse(render_to_string('index.html'))

def map(request):
	"""Returns a map view"""
	return HttpResponse(render_to_string('simplemap.html'))
	
