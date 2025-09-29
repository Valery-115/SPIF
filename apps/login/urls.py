#apps/login/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # URL estatica: '/login/'
    path('', views.user_login, name='login'),
]

    # URL dinámica: (No se usa dinamico en los Logins)
    #path('<slug:post_slug>/', views.login, name='login')