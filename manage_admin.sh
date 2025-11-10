#!/bin/bash

# 🛠️ Django Admin Management Script for Quantum Goose

echo "🛠️ Django Admin Management for Quantum Goose"
echo "═══════════════════════════════════════════════════"
echo ""

# Check if Django is running
if ! curl -s http://localhost:9000/ > /dev/null 2>&1; then
    echo "❌ Django server is not running!"
    echo "   Please start the server first: python manage.py runserver"
    exit 1
fi

echo "✅ Django server is running"
echo ""

# Create a new superuser
create_admin() {
    echo "Creating new admin user..."
    cd /d/project
    
    # Prompt for user details
    read -p "Enter username: " username
    read -s -p "Enter password: " password
    echo ""
    read -p "Enter email (optional): " email
    
    # Create superuser
    python manage.py shell -c "
from django.contrib.auth.models import User
try:
    user = User.objects.create_superuser('$username', '$email' if '$email' else '', '$password')
    print('✅ Admin user created successfully!')
    print(f'   Username: $username')
    print(f'   Email: {$email if '$email' else 'Not provided'}')
    print(f'   Status: Active Superuser')
except Exception as e:
    print(f'❌ Error creating user: {e}')
    if 'already exists' in str(e):
        print('   The username already exists. Try a different username.')
"
}

# List existing admins
list_admins() {
    echo "Current admin users:"
    cd /d/project
    python manage.py shell -c "
from django.contrib.auth.models import User
admins = User.objects.filter(is_superuser=True)
if admins.exists():
    for user in admins:
        print(f'  • {user.username} (email: {user.email or \"N/A\"}, active: {user.is_active})')
else:
    print('  No admin users found.')
"
}

# Reset admin password
reset_password() {
    echo "Resetting admin password..."
    cd /d/project
    
    read -p "Enter username: " username
    read -s -p "Enter new password: " password
    echo ""
    
    python manage.py shell -c "
from django.contrib.auth.models import User
try:
    user = User.objects.get(username='$username')
    if user.is_superuser:
        user.set_password('$password')
        user.save()
        print('✅ Password updated successfully!')
    else:
        print('❌ User is not a superuser.')
except User.DoesNotExist:
    print('❌ User not found.')
except Exception as e:
    print(f'❌ Error: {e}')
"
}

# Main menu
echo "Choose an option:"
echo "1. Create new admin user"
echo "2. List existing admin users"  
echo "3. Reset admin password"
echo "4. Open admin dashboard in browser"
echo "5. Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        create_admin
        ;;
    2)
        list_admins
        ;;
    3)
        reset_password
        ;;
    4)
        echo "Opening admin dashboard..."
        if command -v xdg-open > /dev/null 2>&1; then
            xdg-open http://localhost:9000/admin/
        elif command -v open > /dev/null 2>&1; then
            open http://localhost:9000/admin/
        else
            echo "Please open http://localhost:9000/admin/ in your browser"
        fi
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎯 Admin dashboard available at: http://localhost:9000/admin/"
