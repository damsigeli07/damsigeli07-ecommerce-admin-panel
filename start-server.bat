@echo off
echo Starting ECommerce Admin Panel...
echo.
echo 1. Make sure XAMPP services (Apache + MySQL) are running
echo 2. Make sure pgAdmin4 is connected to ecommerce_admin_db
echo 3. Starting Node.js server...
echo.
cd /d "c:\Users\damsi\OneDrive\Documents\projects\ecommerce-admin-panel"
npm run dev
pause
