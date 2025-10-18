# Science Ideal Home - Hostel Management System

A comprehensive, mobile-first hostel management web application built with HTML, CSS, and JavaScript.

## Features

### 🏠 Dashboard
- Overview cards showing total students, pending payments, staff members, and monthly expenses
- Real-time statistics updated from localStorage data

### 👨‍🎓 Student Management
- **Search & Filter**: Search by name, roll number, or student ID
- **Filter Options**: Present/Ex-students, Payment status (Paid/Unpaid)
- **Student Cards**: Profile photos, names, roll numbers, classes, and payment status
- **Full Profiles**: Detailed student information with payment history
- **Add/Edit Forms**: Comprehensive student information including:
  - Photo upload
  - Personal details (name, roll, class, student ID)
  - Contact information with WhatsApp integration
  - Father's information
  - Address and notes

### 💰 Payment System
- **Payment Forms**: Apartment rent, tuition fees, food bills
- **Automatic Calculation**: Total amount calculation
- **Payment History**: Track all payments with dates and amounts
- **Receipt Generation**: Print-ready payment receipts

### 👥 Staff & Expense Management
- **Staff Salary Tracking**: Manage staff salaries and payments
- **Expense Management**: Track hostel expenses
- **Status Tracking**: Paid/Pending status for all entries
- **Contact Information**: Phone numbers for staff members

### 🧮 Calculator
- Full-featured calculator popup
- Basic arithmetic operations (+, -, ×, ÷)
- Keyboard shortcuts support
- Clear and delete functions

### 📱 Notification System
- **Manual Notifications**: Send notices to selected students
- **SMS Integration**: Placeholder for SMS service integration
- **WhatsApp Integration**: Direct WhatsApp messaging
- **Bulk Messaging**: Send to multiple students at once

## Technical Features

### 📱 Mobile-First Design
- Responsive design that works on all devices
- Touch-friendly interface
- Optimized for mobile usage

### 🎨 Modern UI/UX
- Clean, card-based design
- Soft shadows and rounded corners
- Smooth animations and transitions
- Glass morphism effects
- Professional color scheme

### 💾 Data Management
- **localStorage**: All data stored locally in browser
- **Sample Data**: Pre-loaded with 2 students, 1 staff member, and 1 expense
- **Data Persistence**: Information saved automatically
- **Export Ready**: Prepared for future Google Drive sync

## Sample Data

The application comes with sample data for testing:

### Students
1. **Ahmed Hassan** (Roll: 2023001, HSC Science)
   - Payment history for January and February 2024
   - Complete contact information

2. **Fatima Rahman** (Roll: 2023002, HSC Commerce)
   - Payment history for January 2024
   - Complete contact information

### Staff/Expenses
1. **Hostel Warden - Mr. Karim** (Staff, ৳25,000, Paid)
2. **Electricity Bill** (Expense, ৳8,500, Pending)

## How to Use

1. **Open `index.html`** in any modern web browser
2. **Navigate** using the top navigation tabs
3. **Dashboard**: View overview statistics
4. **Student Section**: 
   - Browse student cards
   - Click on a student to view full profile
   - Use search and filters to find specific students
   - Use bottom action bar for Notice, Payment, and Edit functions
5. **Staff/Expense Section**:
   - View all staff salaries and expenses
   - Click on entries for details
   - Add new entries using the "Add Entry" button
6. **Calculator**: Click the calculator tab for a popup calculator

## Keyboard Shortcuts

- **ESC**: Close any open modal
- **Calculator Mode**:
  - Number keys (0-9): Input numbers
  - +, -, *, /: Operations
  - Enter or =: Calculate result
  - Backspace: Delete last character
  - Delete: Clear all

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- Google Drive synchronization
- Advanced reporting and analytics
- SMS service integration
- Email notifications
- Data export to Excel/PDF
- Multi-hostel management
- Advanced payment tracking
- Attendance management

## File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript (ES6+)**: Interactive functionality
- **Font Awesome**: Icons
- **localStorage API**: Data persistence

## Installation

No installation required! Simply:

1. Download all files
2. Open `index.html` in a web browser
3. Start managing your hostel

---

**Science Ideal Home** - Professional Hostel Management Made Simple