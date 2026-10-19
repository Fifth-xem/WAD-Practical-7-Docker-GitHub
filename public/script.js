
const studentForm = document.getElementById('student-form');
const studentId = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const yearInput = document.getElementById('year');

const studentsList = document.getElementById('students-list');
const message = document.getElementById('message');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');

const API_URL = '/api/students';

// Display messages
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? '#dc2626' : '#15803d';
}

// Load all students
async function loadStudents() {
    studentsList.replaceChildren();

    const loadingRow = document.createElement('tr');
    const loadingCell = document.createElement('td');
    loadingCell.colSpan = 5;
    loadingCell.textContent = 'Loading students...';
    loadingRow.appendChild(loadingCell);
    studentsList.appendChild(loadingRow);

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to load students.');
        }

        const students = await response.json();
        studentsList.replaceChildren();

        if (students.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'No students registered yet.';
            row.appendChild(cell);
            studentsList.appendChild(row);
            return;
        }

        students.forEach((student) => {
            const row = document.createElement('tr');

            [student.name, student.email, student.course,
                `Year ${student.year}`].forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionsCell = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-button';
            editButton.addEventListener('click', () => editStudent(student));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', () => deleteStudent(student._id));

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);
            studentsList.appendChild(row);
        });
    } catch (error) {
        studentsList.replaceChildren();
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = error.message;
        row.appendChild(cell);
        studentsList.appendChild(row);
    }
}

// Add or update a student
studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const student = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        course: courseInput.value.trim(),
        year: Number(yearInput.value)
    };

    const isEditing = Boolean(studentId.value);
    const url = isEditing
        ? `${API_URL}/${studentId.value}`
        : API_URL;

    try {
        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Operation failed.');
        }

        showMessage(isEditing
            ? 'Student updated successfully!'
            : 'Student added successfully!');

        resetForm();
        await loadStudents();
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Fill the form for editing
function editStudent(student) {
    studentId.value = student._id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    courseInput.value = student.course;
    yearInput.value = String(student.year);

    formTitle.textContent = 'Edit Student';
    submitButton.textContent = 'Update Student';
    cancelButton.hidden = false;

    showMessage('Edit the details and click Update Student.');
    document.getElementById('name').focus();
}

// Delete a student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Unable to delete student.');
        }

        showMessage('Student deleted successfully!');
        await loadStudents();
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Reset the form
function resetForm() {
    studentForm.reset();
    studentId.value = '';
    formTitle.textContent = 'Add New Student';
    submitButton.textContent = 'Add Student';
    cancelButton.hidden = true;
}

// Cancel editing
cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage('');
});

// Refresh student list
document.getElementById('refresh-button').addEventListener('click', loadStudents);

// Load existing records when the page opens
loadStudents();
