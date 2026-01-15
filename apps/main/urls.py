from django.urls import path
from . import views

urlpatterns = [
    path('main/', views.main, name='main'),
    path('logout/', views.user_logout, name='logout'),
    
    # URL dinámica: (No se usa dinamico en los Logins)
    #path('<slug:post_slug>/', views.login, name='login'),
]