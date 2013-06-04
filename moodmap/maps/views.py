from django.http import HttpResponse
from django.template.loader import render_to_string

def index(request):
    """Returns a default view"""
    return HttpResponse(render_to_string('index.html'))

def map(request):
	"""Returns a map view"""
	return HttpResponse(render_to_string('index.html'))

def layers(request):
	"""Returns a map view that uses ESRI feature layers"""
	return HttpResponse(render_to_string('maplayers.html'))

def flickr(request):
	"""Returns a map that loads flickr images"""
	return HttpResponse(render_to_string('flickr.html'))

def cloud(request):
	"""Returns a map that loads flickr images"""
	return HttpResponse(render_to_string('cloud.html'))

def about(request):
	"""an about page with sample data"""
	return HttpResponse(render_to_string('about.html'))
