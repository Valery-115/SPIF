from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout

# Create your views here.

# --- Pestalla Web (Login) ---
def user_logout(request):
    logout(request)
    return redirect('login')

# --- Pestalla Web ---
def main(request):
    return render(request, 'main.html')