// Global Variables
let students = [];
let staffEntries = [];
let currentStudentId = null;
let currentEditingStudent = null;

// Data Management
class DataManager {
    static saveStudents() {
        localStorage.setItem('hostel_students', JSON.stringify(students));
    }

    static loadStudents() {
        const data = localStorage.getItem('hostel_students');
        students = data ? JSON.parse(data) : [];
    }

    static saveStaffEntries() {
        localStorage.setItem('hostel_staff', JSON.stringify(staffEntries));
    }

    static loadStaffEntries() {
        const data = localStorage.getItem('hostel_staff');
        staffEntries = data ? JSON.parse(data) : [];
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize Sample Data
function initializeSampleData() {
    if (students.length === 0) {
        students = [
            {
                id: DataManager.generateId(),
                name: "Ahmed Hassan",
                roll: "2023001",
                class: "HSC Science",
                studentId: "SIH001",
                phone: "01712345678",
                fatherName: "Mohammad Hassan",
                fatherPhone: "01987654321",
                address: "123 Main Street, Dhaka",
                notes: "Good student, regular payment",
                photo: null,
                status: "present",
                payments: [
                    {
                        id: DataManager.generateId(),
                        month: "2024-01",
                        apartmentRent: 5000,
                        tuitionFee: 3000,
                        foodBill: 4000,
                        total: 12000,
                        date: "2024-01-15",
                        status: "paid"
                    },
                    {
                        id: DataManager.generateId(),
                        month: "2024-02",
                        apartmentRent: 5000,
                        tuitionFee: 3000,
                        foodBill: 4200,
                        total: 12200,
                        date: "2024-02-15",
                        status: "paid"
                    }
                ]
            },
            {
                id: DataManager.generateId(),
                name: "Fatima Rahman",
                roll: "2023002",
                class: "HSC Commerce",
                studentId: "SIH002",
                phone: "01798765432",
                fatherName: "Abdul Rahman",
                fatherPhone: "01876543210",
                address: "456 Park Avenue, Chittagong",
                notes: "Excellent student",
                photo: null,
                status: "present",
                payments: [
                    {
                        id: DataManager.generateId(),
                        month: "2024-01",
                        apartmentRent: 5000,
                        tuitionFee: 2500,
                        foodBill: 3800,
                        total: 11300,
                        date: "2024-01-10",
                        status: "paid"
                    }
                ]
            }
        ];
        DataManager.saveStudents();
    }

    if (staffEntries.length === 0) {
        staffEntries = [
            {
                id: DataManager.generateId(),
                type: "staff",
                title: "Hostel Warden - Mr. Karim",
                description: "Monthly salary for hostel warden including accommodation management",
                amount: 25000,
                status: "paid",
                phone: "01712345678",
                date: "2024-01-01"
            },
            {
                id: DataManager.generateId(),
                type: "expense",
                title: "Electricity Bill",
                description: "Monthly electricity bill for January 2024",
                amount: 8500,
                status: "pending",
                phone: "01987654321",
                date: "2024-01-31"
            }
        ];
        DataManager.saveStaffEntries();
    }
}

// Navigation
function initializeNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Handle calculator special case
            if (targetTab === 'calculator') {
                showCalculator();
                return;
            }

            // Update active nav tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });

            // Load content based on tab
            switch(targetTab) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'student':
                    renderStudents();
                    break;
                case 'staff':
                    renderStaffEntries();
                    break;
            }
        });
    });
}

// Dashboard Functions
function updateDashboard() {
    const totalStudents = students.length;
    const pendingPayments = students.filter(student => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        return !student.payments.some(payment => payment.month === currentMonth && payment.status === 'paid');
    }).length;
    const totalStaff = staffEntries.filter(entry => entry.type === 'staff').length;
    const monthlyExpenses = staffEntries
        .filter(entry => entry.date.startsWith(new Date().toISOString().slice(0, 7)))
        .reduce((sum, entry) => sum + entry.amount, 0);

    document.getElementById('total-students').textContent = totalStudents;
    document.getElementById('pending-payments').textContent = pendingPayments;
    document.getElementById('total-staff').textContent = totalStaff;
    document.getElementById('monthly-expenses').textContent = `৳${monthlyExpenses.toLocaleString()}`;
}

// Student Functions
function renderStudents() {
    const container = document.getElementById('student-cards');
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const paymentFilter = document.getElementById('payment-filter').value;

    let filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                            student.roll.toLowerCase().includes(searchTerm) ||
                            student.studentId.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        
        let matchesPayment = true;
        if (paymentFilter !== 'all') {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const hasCurrentPayment = student.payments.some(payment => 
                payment.month === currentMonth && payment.status === 'paid'
            );
            matchesPayment = paymentFilter === 'paid' ? hasCurrentPayment : !hasCurrentPayment;
        }

        return matchesSearch && matchesStatus && matchesPayment;
    });

    container.innerHTML = filteredStudents.map(student => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const hasCurrentPayment = student.payments.some(payment => 
            payment.month === currentMonth && payment.status === 'paid'
        );
        const paymentStatus = hasCurrentPayment ? 'paid' : 'unpaid';

        return `
            <div class="student-card" onclick="showStudentProfile('${student.id}')">
                <div class="student-header">
                    <div class="student-photo ${student.photo ? '' : 'placeholder'}">
                        ${student.photo ? `<img src="${student.photo}" alt="${student.name}">` : 
                          `<i class="fas fa-user"></i>`}
                    </div>
                    <div class="student-info">
                        <h3>${student.name}</h3>
                        <p>Roll: ${student.roll} | Class: ${student.class}</p>
                        <span class="payment-status ${paymentStatus}">
                            ${paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showStudentProfile(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    currentStudentId = studentId;
    const modal = document.getElementById('student-profile-modal');
    const content = document.getElementById('student-profile-content');

    content.innerHTML = `
        <div class="profile-header">
            <div class="profile-photo ${student.photo ? '' : 'placeholder'}">
                ${student.photo ? `<img src="${student.photo}" alt="${student.name}">` : 
                  `<i class="fas fa-user"></i>`}
            </div>
            <div>
                <h2>${student.name}</h2>
                <p>Roll: ${student.roll} | Class: ${student.class}</p>
                <p>ID: ${student.studentId}</p>
            </div>
        </div>
        <div class="profile-details">
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${student.phone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Father's Name:</span>
                <span class="detail-value">${student.fatherName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Father's Phone:</span>
                <span class="detail-value">${student.fatherPhone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${student.address}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${student.status}</span>
            </div>
            ${student.notes ? `
            <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${student.notes}</span>
            </div>
            ` : ''}
            
            <div class="payment-history">
                <h4>Payment History</h4>
                ${student.payments.map(payment => `
                    <div class="payment-record">
                        <div>
                            <div class="payment-date">${new Date(payment.date).toLocaleDateString()}</div>
                            <div style="font-size: 0.9rem; color: #666;">${payment.month}</div>
                        </div>
                        <div class="payment-amount">৳${payment.total.toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function showAddStudentForm() {
    currentEditingStudent = null;
    document.getElementById('student-form-title').textContent = 'Add Student';
    document.getElementById('student-form').reset();
    document.getElementById('photo-preview').innerHTML = '<i class="fas fa-camera"></i><span>Add Photo</span>';
    document.getElementById('student-form-modal').classList.add('active');
}

function showEditStudentForm() {
    if (!currentStudentId) return;
    
    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;

    currentEditingStudent = student;
    document.getElementById('student-form-title').textContent = 'Edit Student';
    
    // Populate form
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-roll').value = student.roll;
    document.getElementById('student-class').value = student.class;
    document.getElementById('student-id').value = student.studentId;
    document.getElementById('student-phone').value = student.phone;
    document.getElementById('father-name').value = student.fatherName;
    document.getElementById('father-phone').value = student.fatherPhone;
    document.getElementById('student-address').value = student.address;
    document.getElementById('student-notes').value = student.notes;

    if (student.photo) {
        document.getElementById('photo-preview').innerHTML = `<img src="${student.photo}" alt="Student Photo">`;
    }

    document.getElementById('student-form-modal').classList.add('active');
}

function saveStudent(formData) {
    if (currentEditingStudent) {
        // Update existing student
        const index = students.findIndex(s => s.id === currentEditingStudent.id);
        students[index] = { ...students[index], ...formData };
    } else {
        // Add new student
        const newStudent = {
            id: DataManager.generateId(),
            ...formData,
            status: 'present',
            payments: []
        };
        students.push(newStudent);
    }

    DataManager.saveStudents();
    renderStudents();
    updateDashboard();
}

// Staff Functions
function renderStaffEntries() {
    const container = document.getElementById('staff-cards');
    
    container.innerHTML = staffEntries.map(entry => `
        <div class="staff-card" onclick="showStaffDetails('${entry.id}')">
            <div class="staff-header">
                <div>
                    <div class="staff-title">${entry.title}</div>
                    <div class="staff-type" style="font-size: 0.9rem; color: #666; text-transform: capitalize;">
                        ${entry.type}
                    </div>
                </div>
                <div class="staff-amount">৳${entry.amount.toLocaleString()}</div>
            </div>
            <div class="staff-description">${entry.description}</div>
            <div class="staff-footer">
                <div class="staff-phone">
                    <i class="fas fa-phone"></i> ${entry.phone}
                </div>
                <span class="staff-status ${entry.status}">${entry.status}</span>
            </div>
        </div>
    `).join('');
}

function showStaffDetails(entryId) {
    const entry = staffEntries.find(e => e.id === entryId);
    if (!entry) return;

    alert(`${entry.title}\n\nDescription: ${entry.description}\nAmount: ৳${entry.amount.toLocaleString()}\nStatus: ${entry.status}\nPhone: ${entry.phone}\nDate: ${new Date(entry.date).toLocaleDateString()}`);
}

function showAddStaffForm() {
    document.getElementById('staff-form-title').textContent = 'Add Staff/Expense';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-form-modal').classList.add('active');
}

function saveStaffEntry(formData) {
    const newEntry = {
        id: DataManager.generateId(),
        ...formData,
        date: new Date().toISOString().split('T')[0]
    };
    
    staffEntries.push(newEntry);
    DataManager.saveStaffEntries();
    renderStaffEntries();
    updateDashboard();
}

// Payment Functions
function showPaymentForm() {
    if (!currentStudentId) {
        alert('Please select a student first');
        return;
    }

    const studentSelect = document.getElementById('payment-student');
    studentSelect.innerHTML = '<option value="">Select Student</option>' +
        students.map(student => 
            `<option value="${student.id}" ${student.id === currentStudentId ? 'selected' : ''}>
                ${student.name} (${student.roll})
            </option>`
        ).join('');

    // Set current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('payment-month').value = currentMonth;

    document.getElementById('payment-form-modal').classList.add('active');
}

function calculatePaymentTotal() {
    const apartmentRent = parseFloat(document.getElementById('apartment-rent').value) || 0;
    const tuitionFee = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const foodBill = parseFloat(document.getElementById('food-bill').value) || 0;
    
    const total = apartmentRent + tuitionFee + foodBill;
    document.getElementById('total-amount').value = total;
}

function processPayment(paymentData) {
    const student = students.find(s => s.id === paymentData.studentId);
    if (!student) return;

    const payment = {
        id: DataManager.generateId(),
        month: paymentData.month,
        apartmentRent: paymentData.apartmentRent,
        tuitionFee: paymentData.tuitionFee,
        foodBill: paymentData.foodBill,
        total: paymentData.total,
        date: new Date().toISOString().split('T')[0],
        status: 'paid'
    };

    student.payments.push(payment);
    DataManager.saveStudents();
    renderStudents();
    updateDashboard();

    alert(`Payment of ৳${payment.total.toLocaleString()} processed successfully for ${student.name}`);
}

function printReceipt() {
    const studentId = document.getElementById('payment-student').value;
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const month = document.getElementById('payment-month').value;
    const apartmentRent = parseFloat(document.getElementById('apartment-rent').value) || 0;
    const tuitionFee = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const foodBill = parseFloat(document.getElementById('food-bill').value) || 0;
    const total = apartmentRent + tuitionFee + foodBill;

    const receiptContent = `
        SCIENCE IDEAL HOME
        Payment Receipt
        
        Student: ${student.name}
        Roll: ${student.roll}
        Month: ${month}
        
        Apartment Rent: ৳${apartmentRent.toLocaleString()}
        Tuition Fee: ৳${tuitionFee.toLocaleString()}
        Food Bill: ৳${foodBill.toLocaleString()}
        
        Total: ৳${total.toLocaleString()}
        
        Date: ${new Date().toLocaleDateString()}
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head><title>Payment Receipt</title></head>
            <body style="font-family: monospace; padding: 20px;">
                <pre>${receiptContent}</pre>
            </body>
        </html>
    `);
    printWindow.print();
}

// Calculator Functions
function showCalculator() {
    document.getElementById('calculator-popup').classList.add('active');
    document.getElementById('calc-display').value = '';
}

function appendToDisplay(value) {
    const display = document.getElementById('calc-display');
    display.value += value;
}

function clearCalculator() {
    document.getElementById('calc-display').value = '';
}

function clearEntry() {
    document.getElementById('calc-display').value = '';
}

function deleteLast() {
    const display = document.getElementById('calc-display');
    display.value = display.value.slice(0, -1);
}

function calculateResult() {
    const display = document.getElementById('calc-display');
    try {
        const result = eval(display.value.replace('×', '*'));
        display.value = result;
    } catch (error) {
        display.value = 'Error';
    }
}

// Notification Functions
function showNoticeForm() {
    const recipientsSelect = document.getElementById('notice-recipients');
    recipientsSelect.innerHTML = students.map(student => 
        `<option value="${student.id}">${student.name} (${student.roll})</option>`
    ).join('');

    document.getElementById('notice-modal').classList.add('active');
}

function sendNotice(noticeData) {
    const selectedStudents = Array.from(document.getElementById('notice-recipients').selectedOptions)
        .map(option => students.find(s => s.id === option.value));

    const sendSMS = document.getElementById('send-sms').checked;
    const sendWhatsApp = document.getElementById('send-whatsapp').checked;

    selectedStudents.forEach(student => {
        if (sendSMS) {
            // Placeholder for SMS integration
            console.log(`SMS to ${student.phone}: ${noticeData.message}`);
        }
        if (sendWhatsApp) {
            // Open WhatsApp with pre-filled message
            const whatsappUrl = `https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(noticeData.message)}`;
            window.open(whatsappUrl, '_blank');
        }
    });

    alert(`Notice sent to ${selectedStudents.length} student(s)`);
}

// Utility Functions
function openWhatsApp(type) {
    let phone = '';
    if (type === 'student') {
        phone = document.getElementById('student-phone').value;
    } else if (type === 'father') {
        phone = document.getElementById('father-phone').value;
    }
    
    if (phone) {
        const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;
        window.open(whatsappUrl, '_blank');
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photo-preview').innerHTML = 
                `<img src="${e.target.result}" alt="Student Photo">`;
        };
        reader.readAsDataURL(file);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    DataManager.loadStudents();
    DataManager.loadStaffEntries();
    initializeSampleData();

    // Initialize navigation
    initializeNavigation();

    // Initialize dashboard
    updateDashboard();
    renderStudents();

    // Search and filter listeners
    document.getElementById('student-search').addEventListener('input', renderStudents);
    document.getElementById('status-filter').addEventListener('change', renderStudents);
    document.getElementById('payment-filter').addEventListener('change', renderStudents);

    // Button listeners
    document.getElementById('add-student-btn').addEventListener('click', showAddStudentForm);
    document.getElementById('add-staff-btn').addEventListener('click', showAddStaffForm);

    // Bottom bar listeners
    document.getElementById('notice-btn').addEventListener('click', showNoticeForm);
    document.getElementById('payment-btn').addEventListener('click', showPaymentForm);
    document.getElementById('edit-btn').addEventListener('click', showEditStudentForm);

    // Modal close listeners
    document.querySelectorAll('.close-btn, .popup-overlay').forEach(element => {
        element.addEventListener('click', function(e) {
            if (e.target === this) {
                document.querySelectorAll('.popup-overlay').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    });

    // Form listeners
    document.getElementById('student-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('student-name').value,
            roll: document.getElementById('student-roll').value,
            class: document.getElementById('student-class').value,
            studentId: document.getElementById('student-id').value,
            phone: document.getElementById('student-phone').value,
            fatherName: document.getElementById('father-name').value,
            fatherPhone: document.getElementById('father-phone').value,
            address: document.getElementById('student-address').value,
            notes: document.getElementById('student-notes').value,
            photo: document.getElementById('photo-preview').querySelector('img')?.src || null
        };
        saveStudent(formData);
        document.getElementById('student-form-modal').classList.remove('active');
    });

    document.getElementById('staff-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            type: document.getElementById('entry-type').value,
            title: document.getElementById('entry-title').value,
            description: document.getElementById('entry-description').value,
            amount: parseFloat(document.getElementById('entry-amount').value),
            status: document.getElementById('entry-status').value,
            phone: document.getElementById('entry-phone').value
        };
        saveStaffEntry(formData);
        document.getElementById('staff-form-modal').classList.remove('active');
    });

    document.getElementById('payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const paymentData = {
            studentId: document.getElementById('payment-student').value,
            month: document.getElementById('payment-month').value,
            apartmentRent: parseFloat(document.getElementById('apartment-rent').value) || 0,
            tuitionFee: parseFloat(document.getElementById('tuition-fee').value) || 0,
            foodBill: parseFloat(document.getElementById('food-bill').value) || 0,
            total: parseFloat(document.getElementById('total-amount').value)
        };
        processPayment(paymentData);
        document.getElementById('payment-form-modal').classList.remove('active');
    });

    document.getElementById('notice-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const noticeData = {
            message: document.getElementById('notice-message').value
        };
        sendNotice(noticeData);
        document.getElementById('notice-modal').classList.remove('active');
    });

    // Payment calculation listeners
    document.querySelectorAll('.payment-item').forEach(input => {
        input.addEventListener('input', calculatePaymentTotal);
    });

    // Photo upload listener
    document.getElementById('student-photo').addEventListener('change', handlePhotoUpload);

    // Print receipt listener
    document.getElementById('print-receipt').addEventListener('click', printReceipt);

    // Cancel button listeners
    document.querySelectorAll('[id$="-form"] .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.popup-overlay').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });

    // Calculator close listener
    document.getElementById('close-calculator').addEventListener('click', function() {
        document.getElementById('calculator-popup').classList.remove('active');
    });

    // Close other modals
    document.getElementById('close-student-profile').addEventListener('click', function() {
        document.getElementById('student-profile-modal').classList.remove('active');
    });

    document.getElementById('close-student-form').addEventListener('click', function() {
        document.getElementById('student-form-modal').classList.remove('active');
    });

    document.getElementById('close-payment-form').addEventListener('click', function() {
        document.getElementById('payment-form-modal').classList.remove('active');
    });

    document.getElementById('close-staff-form').addEventListener('click', function() {
        document.getElementById('staff-form-modal').classList.remove('active');
    });

    document.getElementById('close-notice').addEventListener('click', function() {
        document.getElementById('notice-modal').classList.remove('active');
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.popup-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Calculator shortcuts
    if (document.getElementById('calculator-popup').classList.contains('active')) {
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            appendToDisplay(e.key);
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            appendToDisplay(e.key === '*' ? '*' : e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            calculateResult();
        } else if (e.key === 'Backspace') {
            deleteLast();
        } else if (e.key === 'Delete') {
            clearCalculator();
        }
    }
});