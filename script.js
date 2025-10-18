// Global variables
let students = [];
let staffEntries = [];
let currentStudentId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeEventListeners();
    updateDashboard();
    renderStudentCards();
    renderStaffCards();
});

// Data Management
function loadData() {
    // Load students from localStorage
    const savedStudents = localStorage.getItem('scienceIdealHome_students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    } else {
        // Add sample data
        students = [
            {
                id: 1,
                name: 'Ahmed Hassan',
                roll: '2024001',
                class: 'BSc Physics',
                studentId: 'SIH001',
                phone: '+8801712345678',
                fatherName: 'Md. Karim Hassan',
                fatherPhone: '+8801712345679',
                address: 'Dhaka, Bangladesh',
                notes: 'Excellent student, very punctual',
                photo: null,
                status: 'present',
                paymentStatus: 'paid',
                payments: [
                    {
                        id: 1,
                        date: '2024-01-15',
                        apartment: 5000,
                        tuition: 3000,
                        food: 2000,
                        total: 10000,
                        month: '2024-01'
                    }
                ]
            },
            {
                id: 2,
                name: 'Fatima Begum',
                roll: '2024002',
                class: 'BSc Chemistry',
                studentId: 'SIH002',
                phone: '+8801712345680',
                fatherName: 'Md. Rahman',
                fatherPhone: '+8801712345681',
                address: 'Chittagong, Bangladesh',
                notes: 'Needs extra attention in mathematics',
                photo: null,
                status: 'present',
                paymentStatus: 'unpaid',
                payments: []
            }
        ];
        saveStudents();
    }

    // Load staff entries from localStorage
    const savedStaff = localStorage.getItem('scienceIdealHome_staff');
    if (savedStaff) {
        staffEntries = JSON.parse(savedStaff);
    } else {
        // Add sample data
        staffEntries = [
            {
                id: 1,
                type: 'salary',
                title: 'Caretaker Salary - January',
                description: 'Monthly salary for caretaker Mr. Ali',
                amount: 15000,
                phone: '+8801712345682',
                status: 'paid',
                date: '2024-01-01'
            },
            {
                id: 2,
                type: 'expense',
                title: 'Electricity Bill',
                description: 'Monthly electricity bill for hostel',
                amount: 8000,
                phone: '+8801712345683',
                status: 'pending',
                date: '2024-01-15'
            }
        ];
        saveStaffEntries();
    }
}

function saveStudents() {
    localStorage.setItem('scienceIdealHome_students', JSON.stringify(students));
}

function saveStaffEntries() {
    localStorage.setItem('scienceIdealHome_staff', JSON.stringify(staffEntries));
}

// Event Listeners
function initializeEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Student section
    document.getElementById('add-student-btn').addEventListener('click', openAddStudentModal);
    document.getElementById('add-student-form').addEventListener('submit', handleAddStudent);
    document.getElementById('cancel-student').addEventListener('click', closeModal);
    document.getElementById('student-search').addEventListener('input', filterStudents);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterStudents();
        });
    });

    // Staff section
    document.getElementById('add-staff-btn').addEventListener('click', openAddStaffModal);
    document.getElementById('add-staff-form').addEventListener('submit', handleAddStaff);
    document.getElementById('cancel-staff').addEventListener('click', closeModal);

    // Calculator
    document.getElementById('open-calculator-btn').addEventListener('click', openCalculatorModal);

    // Payment form
    document.getElementById('payment-form').addEventListener('submit', handlePayment);
    document.getElementById('cancel-payment').addEventListener('click', closeModal);
    document.getElementById('print-receipt').addEventListener('click', printReceipt);

    // Payment amount calculation
    document.getElementById('apartment-fee').addEventListener('input', calculateTotal);
    document.getElementById('tuition-fee').addEventListener('input', calculateTotal);
    document.getElementById('food-bills').addEventListener('input', calculateTotal);

    // WhatsApp button
    document.getElementById('whatsapp-btn').addEventListener('click', openWhatsApp);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Profile actions
    document.getElementById('send-notice-btn').addEventListener('click', sendNotice);
    document.getElementById('make-payment-btn').addEventListener('click', openPaymentModal);
    document.getElementById('edit-student-btn').addEventListener('click', editStudent);
}

// Navigation
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabId).classList.add('active');

    // Add active class to selected tab
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update dashboard if switching to dashboard tab
    if (tabId === 'dashboard') {
        updateDashboard();
    }
}

// Dashboard
function updateDashboard() {
    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.paymentStatus === 'paid').length;
    const unpaidStudents = totalStudents - paidStudents;
    const totalRevenue = students.reduce((sum, student) => {
        return sum + student.payments.reduce((studentSum, payment) => studentSum + payment.total, 0);
    }, 0);

    document.getElementById('total-students').textContent = totalStudents;
    document.getElementById('paid-students').textContent = paidStudents;
    document.getElementById('unpaid-students').textContent = unpaidStudents;
    document.getElementById('total-revenue').textContent = `৳${totalRevenue.toLocaleString()}`;
}

// Student Management
function renderStudentCards(filteredStudents = null) {
    const studentsToRender = filteredStudents || students;
    const container = document.getElementById('student-cards');
    
    if (studentsToRender.length === 0) {
        container.innerHTML = '<div class="no-data">No students found</div>';
        return;
    }

    container.innerHTML = studentsToRender.map(student => `
        <div class="student-card" onclick="openStudentProfile(${student.id})">
            <img src="${student.photo || 'https://via.placeholder.com/60x60?text=Photo'}" 
                 alt="${student.name}" class="student-photo">
            <div class="student-info">
                <h3>${student.name}</h3>
                <p><strong>Roll:</strong> ${student.roll}</p>
                <p><strong>Class:</strong> ${student.class}</p>
                <p><strong>ID:</strong> ${student.studentId}</p>
                <p><strong>Phone:</strong> ${student.phone}</p>
                <div class="student-status status-${student.paymentStatus}">
                    ${student.paymentStatus.toUpperCase()}
                </div>
                <div class="student-status status-${student.status}">
                    ${student.status === 'present' ? 'PRESENT' : 'EX-STUDENT'}
                </div>
            </div>
        </div>
    `).join('');
}

function filterStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    
    let filtered = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                            student.roll.toLowerCase().includes(searchTerm) ||
                            student.studentId.toLowerCase().includes(searchTerm);
        
        let matchesFilter = true;
        if (activeFilter === 'present') {
            matchesFilter = student.status === 'present';
        } else if (activeFilter === 'ex') {
            matchesFilter = student.status === 'ex';
        } else if (activeFilter === 'paid') {
            matchesFilter = student.paymentStatus === 'paid';
        } else if (activeFilter === 'unpaid') {
            matchesFilter = student.paymentStatus === 'unpaid';
        }
        
        return matchesSearch && matchesFilter;
    });
    
    renderStudentCards(filtered);
}

function openAddStudentModal() {
    document.getElementById('add-student-modal').style.display = 'block';
    document.getElementById('add-student-form').reset();
}

function handleAddStudent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newStudent = {
        id: Date.now(),
        name: document.getElementById('student-name').value,
        roll: document.getElementById('student-roll').value,
        class: document.getElementById('student-class').value,
        studentId: document.getElementById('student-id').value,
        phone: document.getElementById('student-phone').value,
        fatherName: document.getElementById('father-name').value,
        fatherPhone: document.getElementById('father-phone').value,
        address: document.getElementById('student-address').value,
        notes: document.getElementById('student-notes').value,
        photo: null,
        status: 'present',
        paymentStatus: 'unpaid',
        payments: []
    };
    
    students.push(newStudent);
    saveStudents();
    renderStudentCards();
    updateDashboard();
    closeModal();
    showMessage('Student added successfully!', 'success');
}

function openStudentProfile(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    currentStudentId = studentId;
    
    const profileContent = document.getElementById('profile-content');
    profileContent.innerHTML = `
        <img src="${student.photo || 'https://via.placeholder.com/100x100?text=Photo'}" 
             alt="${student.name}" class="profile-photo">
        <div class="profile-info">
            <h3>${student.name}</h3>
            <p><strong>Roll:</strong> ${student.roll}</p>
            <p><strong>Class:</strong> ${student.class}</p>
            <p><strong>Student ID:</strong> ${student.studentId}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <p><strong>Father:</strong> ${student.fatherName}</p>
            <p><strong>Father's Phone:</strong> ${student.fatherPhone}</p>
            <p><strong>Address:</strong> ${student.address}</p>
            <p><strong>Notes:</strong> ${student.notes}</p>
        </div>
        <div class="payment-history">
            <h4>Payment History</h4>
            ${student.payments.length > 0 ? 
                student.payments.map(payment => `
                    <div class="payment-item">
                        <span>${new Date(payment.date).toLocaleDateString()} - ${payment.month}</span>
                        <span>৳${payment.total.toLocaleString()}</span>
                    </div>
                `).join('') : 
                '<p>No payments recorded</p>'
            }
        </div>
    `;
    
    document.getElementById('student-profile-modal').style.display = 'block';
}

function sendNotice() {
    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;
    
    const message = prompt('Enter your message:');
    if (message) {
        // In a real app, this would integrate with SMS/WhatsApp APIs
        alert(`Notice sent to ${student.name} (${student.phone}):\n\n${message}`);
        showMessage('Notice sent successfully!', 'success');
    }
}

function openPaymentModal() {
    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;
    
    document.getElementById('payment-student-id').value = currentStudentId;
    document.getElementById('payment-modal').style.display = 'block';
    closeModal(); // Close profile modal
}

function handlePayment(e) {
    e.preventDefault();
    
    const studentId = parseInt(document.getElementById('payment-student-id').value);
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const apartment = parseFloat(document.getElementById('apartment-fee').value) || 0;
    const tuition = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const food = parseFloat(document.getElementById('food-bills').value) || 0;
    const month = document.getElementById('payment-month').value;
    const total = apartment + tuition + food;
    
    if (total <= 0) {
        showMessage('Please enter a valid amount', 'error');
        return;
    }
    
    const payment = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        apartment,
        tuition,
        food,
        total,
        month
    };
    
    student.payments.push(payment);
    student.paymentStatus = 'paid';
    
    saveStudents();
    renderStudentCards();
    updateDashboard();
    closeModal();
    showMessage('Payment processed successfully!', 'success');
}

function calculateTotal() {
    const apartment = parseFloat(document.getElementById('apartment-fee').value) || 0;
    const tuition = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const food = parseFloat(document.getElementById('food-bills').value) || 0;
    const total = apartment + tuition + food;
    
    document.getElementById('total-amount').value = total;
}

function printReceipt() {
    const studentId = parseInt(document.getElementById('payment-student-id').value);
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const apartment = parseFloat(document.getElementById('apartment-fee').value) || 0;
    const tuition = parseFloat(document.getElementById('tuition-fee').value) || 0;
    const food = parseFloat(document.getElementById('food-bills').value) || 0;
    const total = apartment + tuition + food;
    const month = document.getElementById('payment-month').value;
    
    const receiptContent = `
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
            <h2>Science Ideal Home</h2>
            <h3>Payment Receipt</h3>
            <hr>
            <p><strong>Student:</strong> ${student.name}</p>
            <p><strong>Roll:</strong> ${student.roll}</p>
            <p><strong>Class:</strong> ${student.class}</p>
            <p><strong>Month:</strong> ${month}</p>
            <hr>
            <p><strong>Apartment Fee:</strong> ৳${apartment.toLocaleString()}</p>
            <p><strong>Tuition Fee:</strong> ৳${tuition.toLocaleString()}</p>
            <p><strong>Food Bills:</strong> ৳${food.toLocaleString()}</p>
            <hr>
            <h3><strong>Total Amount:</strong> ৳${total.toLocaleString()}</h3>
            <hr>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Thank you for your payment!</p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
}

function editStudent() {
    // This would open an edit form similar to add student
    showMessage('Edit functionality will be implemented', 'success');
}

// Staff Management
function renderStaffCards() {
    const container = document.getElementById('staff-cards');
    
    if (staffEntries.length === 0) {
        container.innerHTML = '<div class="no-data">No entries found</div>';
        return;
    }
    
    container.innerHTML = staffEntries.map(entry => `
        <div class="staff-card" onclick="openStaffDetails(${entry.id})">
            <h3>${entry.title}</h3>
            <p>${entry.description}</p>
            <div class="staff-amount">৳${entry.amount.toLocaleString()}</div>
            <p><strong>Phone:</strong> ${entry.phone}</p>
            <div class="student-status status-${entry.status}">
                ${entry.status.toUpperCase()}
            </div>
        </div>
    `).join('');
}

function openAddStaffModal() {
    document.getElementById('add-staff-modal').style.display = 'block';
    document.getElementById('add-staff-form').reset();
}

function handleAddStaff(e) {
    e.preventDefault();
    
    const newEntry = {
        id: Date.now(),
        type: document.getElementById('entry-type').value,
        title: document.getElementById('entry-title').value,
        description: document.getElementById('entry-description').value,
        amount: parseFloat(document.getElementById('entry-amount').value),
        phone: document.getElementById('entry-phone').value,
        status: document.getElementById('entry-status').value,
        date: new Date().toISOString().split('T')[0]
    };
    
    staffEntries.push(newEntry);
    saveStaffEntries();
    renderStaffCards();
    closeModal();
    showMessage('Entry added successfully!', 'success');
}

function openStaffDetails(entryId) {
    const entry = staffEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    alert(`Entry Details:\n\nTitle: ${entry.title}\nDescription: ${entry.description}\nAmount: ৳${entry.amount.toLocaleString()}\nPhone: ${entry.phone}\nStatus: ${entry.status}\nDate: ${entry.date}`);
}

// Calculator
function openCalculatorModal() {
    document.getElementById('calculator-modal').style.display = 'block';
    clearCalculator();
}

// Calculator functions
let currentInput = '';
let operator = '';
let previousInput = '';

function appendToDisplay(value) {
    if (value === '.' && currentInput.includes('.')) return;
    currentInput += value;
    document.getElementById('calc-display').value = currentInput;
}

function clearCalculator() {
    currentInput = '';
    operator = '';
    previousInput = '';
    document.getElementById('calc-display').value = '';
}

function clearEntry() {
    currentInput = '';
    document.getElementById('calc-display').value = currentInput;
}

function calculate() {
    if (operator && previousInput && currentInput) {
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        let result;
        
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = current !== 0 ? prev / current : 0;
                break;
        }
        
        currentInput = result.toString();
        document.getElementById('calc-display').value = currentInput;
        operator = '';
        previousInput = '';
    }
}

// Utility Functions
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function openWhatsApp() {
    const phone = document.getElementById('student-phone').value;
    if (phone) {
        const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
        window.open(whatsappUrl, '_blank');
    } else {
        showMessage('Please enter a phone number first', 'error');
    }
}

// Initialize calculator event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for calculator buttons
    document.querySelectorAll('.calc-btn').forEach(btn => {
        if (btn.textContent.match(/[0-9.]/)) {
            btn.addEventListener('click', function() {
                appendToDisplay(this.textContent);
            });
        } else if (btn.textContent.match(/[+\-*/]/)) {
            btn.addEventListener('click', function() {
                if (currentInput && previousInput && operator) {
                    calculate();
                }
                operator = this.textContent;
                previousInput = currentInput;
                currentInput = '';
            });
        }
    });
});