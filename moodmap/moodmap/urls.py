from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'maps.views.map'),
    url(r'^maps/$', 'maps.views.map'),
    url(r'layers/$', 'maps.views.layers'),
    url(r'flickr/$', 'maps.views.flickr'),
    url(r'cloud/$', 'maps.views.cloud'),
    url(r'about/$', 'maps.views.about'),
    url(r'^api/(.*)\.json$', 'maps.apis.dispatch'),
    # Examples:
    # url(r'^$', 'moodmap.views.home', name='home'),
    # url(r'^moodmap/', include('moodmap.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += staticfiles_urlpatterns()
