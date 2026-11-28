
"use strict";

const ADMIN_CODE = "CAMPUS@123";
const STORAGE_KEY = "campusFixComplaintsV1";

// HTML elements
const complaintForm = document.getElementById("complaintForm");
const formMessage = document.getElementById("formMessage");
const trackForm = document.getElementById("trackForm");
const trackResult = document.getElementById("trackResult");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminMessage = document.getElementById("adminMessage");
const adminLogin = document.getElementById("adminLogin");
const adminDashboard = document.getElementById("adminDashboard");
const adminComplaints = document.getElementById("adminComplaints");
const adminSearch = document.getElementById("adminSearch");
const statusFilter = document.getElementById("statusFilter");
const adminLogout = document.getElementById("adminLogout");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

const VALID_STATUSES = ["Pending", "In Progress", "Resolved"];

// Read complaints safely from localStorage
function loadComplaints() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) return [];

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) return [];

        return parsedData.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.studentId === "string" &&
            typeof item.category === "string" &&
            typeof item.location === "string" &&
            typeof item.description === "string" &&
            typeof item.date === "string" &&
            VALID_STATUSES.includes(item.status)
        );
    } catch (error) {
        console.error("Complaint data could not be read:", error);
        return [];
    }
}

let complaints = loadComplaints();

// Save complaints to localStorage
function saveComplaints() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
        return true;
    } catch (error) {
        console.error("Complaint data could not be saved:", error);

        alert(
            "Data save nahi ho paya. Browser storage full ho sakta hai."
        );

        return false;
    }
}

// Show messages safely
function setMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.className = "message " + type;
}

// Create an element with safe text content
function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

complaintForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const studentId = document.getElementById("studentId").value.trim();
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!name || !studentId || !category || !location || !description) {
        setMessage(formMessage, "Kripya sabhi required details bharo.", "error");
        return;
    }

    if (name.length > 80 || studentId.length > 40 ||
        location.length > 120 || description.length > 1000) {
        setMessage(formMessage, "Kisi field mein allowed limit se zyada text hai.", "error");
        return;
    }

    const complaint = {
        id: "CF-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 6).toUpperCase(),
        name: name,
        studentId: studentId,
        category: category,
        location: location,
        description: description,
        status: "Pending",
        date: new Date().toLocaleString("en-IN")
    };

    complaints.unshift(complaint);

    if (!saveComplaints()) {
        complaints.shift();
        return;
    }

    complaintForm.reset();

    setMessage(
        formMessage,
        "Complaint submit ho gayi! Aapki Complaint ID: " + complaint.id,
        "success"
    );

    // Student ko complaint ID bhi dikhao
    trackResult.replaceChildren();

    const resultCard = makeElement("div", "track-card");
    resultCard.append(
        makeElement("h3", "", "Complaint Successfully Submitted!"),
        makeElement("p", "", "Complaint ID: " + complaint.id),
        makeElement("p", "", "Is ID ko future tracking ke liye save kar lo."),
        makeElement("p", "", "Status: " + complaint.status)
    );

    trackResult.appendChild(resultCard);

    // Dashboard update if admin is already logged in
    if (!adminDashboard.hidden) {
        renderAdminDashboard();
    }
});


trackForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const enteredId = document.getElementById("trackId")
        .value.trim().toUpperCase();

    const complaint = complaints.find(item =>
        item.id.toUpperCase() === enteredId
    );

    trackResult.replaceChildren();

    if (!complaint) {
        trackResult.appendChild(
            makeElement(
                "div",
                "empty-state",
                "Complaint nahi mili. Apni Complaint ID check karo."
            )
        );
        return;
    }

    const card = makeElement("div", "track-card");
    const title = makeElement("h3", "", complaint.category + " Complaint");
    const id = makeElement("p", "", "Complaint ID: " + complaint.id);
    const statusText = makeElement("p", "", "Status: " + complaint.status);
    const status = makeElement("span", getStatusClass(complaint.status),
        complaint.status);
    const location = makeElement("p", "", "Location: " + complaint.location);
    const date = makeElement("p", "", "Submitted: " + complaint.date);
    const description = makeElement(
        "p", "", "Description: " + complaint.description
    );

    card.append(title, id, statusText, status, location, date, description);
    trackResult.appendChild(card);
});

adminLoginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const code = document.getElementById("adminCode").value;

    if (code !== ADMIN_CODE) {
        setMessage(adminMessage, "Wrong admin code. Dobara try karo.", "error");
        return;
    }

    adminLogin.hidden = true;
    adminDashboard.hidden = false;

    document.getElementById("adminCode").value = "";
    setMessage(adminMessage, "", "");

    renderAdminDashboard();
});

adminLogout.addEventListener("click", function () {
    adminDashboard.hidden = true;
    adminLogin.hidden = false;
    document.getElementById("adminCode").value = "";
    adminSearch.value = "";
    statusFilter.value = "All";
    setMessage(adminMessage, "Admin logout ho gaya.", "success");
});

function updateStatistics() {
    document.getElementById("totalCount").textContent = complaints.length;

    document.getElementById("pendingCount").textContent =
        complaints.filter(item => item.status === "Pending").length;

    document.getElementById("progressCount").textContent =
        complaints.filter(item => item.status === "In Progress").length;

    document.getElementById("resolvedCount").textContent =
        complaints.filter(item => item.status === "Resolved").length;
}

function getStatusClass(status) {
    if (status === "Resolved") return "status-badge status-resolved";
    if (status === "In Progress") return "status-badge status-progress";

    return "status-badge status-pending";
}

function renderAdminDashboard() {
    updateStatistics();
    adminComplaints.replaceChildren();

    const searchText = adminSearch.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filtered = complaints.filter(item => {
        const matchesStatus =
            selectedStatus === "All" || item.status === selectedStatus;

        const searchableText = [
            item.id,
            item.name,
            item.studentId,
            item.category,
            item.location,
            item.description
        ].join(" ").toLowerCase();

        return matchesStatus && searchableText.includes(searchText);
    });

    if (filtered.length === 0) {
        adminComplaints.appendChild(
            makeElement(
                "div",
                "empty-state",
                complaints.length === 0
                    ? "Abhi koi complaint submit nahi hui hai."
                    : "Is search ya filter se koi complaint nahi mili."
            )
        );
        return;
    }

    filtered.forEach(item => {
        const card = makeElement("article", "admin-complaint");

        const top = makeElement("div", "complaint-card-top");
        const titleGroup = makeElement("div", "");
        const title = makeElement("h4", "", item.category);
        const id = makeElement("p", "complaint-id", item.id);
        titleGroup.append(title, id);

        const badge = makeElement(
            "span",
            getStatusClass(item.status),
            item.status
        );

        top.append(titleGroup, badge);

        const student = makeElement(
            "p", "complaint-meta",
            "Student: " + item.name + " | Roll No.: " + item.studentId
        );

        const location = makeElement(
            "p", "complaint-meta", "Location: " + item.location
        );

        const date = makeElement(
            "p", "complaint-meta", "Submitted: " + item.date
        );

        const description = makeElement(
            "p", "complaint-description", item.description
        );

        const actions = makeElement("div", "complaint-actions");
        const statusSelect = document.createElement("select");
        statusSelect.setAttribute("aria-label", "Update complaint status");

        VALID_STATUSES.forEach(statusValue => {
            const option = document.createElement("option");
            option.value = statusValue;
            option.textContent = statusValue;
            statusSelect.appendChild(option);
        });

        statusSelect.value = item.status;

        statusSelect.addEventListener("change", function () {
            const oldStatus = item.status;
            item.status = statusSelect.value;

            if (!saveComplaints()) {
                item.status = oldStatus;
                statusSelect.value = oldStatus;
                return;
            }

            renderAdminDashboard();
        });

        const deleteButton = makeElement("button", "delete-btn", "Delete");
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            const confirmed = window.confirm(
                "Kya aap complaint " + item.id + " ko delete karna chahte ho?"
            );

            if (!confirmed) return;

            const oldComplaints = complaints;
            complaints = complaints.filter(c => c.id !== item.id);

            if (!saveComplaints()) {
                complaints = oldComplaints;
                return;
            }

            // If the student was viewing this complaint, clear the result
            if (document.getElementById("trackId").value.trim().toUpperCase()
                === item.id.toUpperCase()) {
                trackResult.replaceChildren();
            }

            renderAdminDashboard();
        });

        actions.append(statusSelect, deleteButton);
        card.append(top, student, location, date, description, actions);
        adminComplaints.appendChild(card);
    });
}

adminSearch.addEventListener("input", renderAdminDashboard);
statusFilter.addEventListener("change", renderAdminDashboard);

menuBtn.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");

    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );
    menuBtn.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open navigation");
        menuBtn.textContent = "☰";
    });
});

document.getElementById("currentYear").textContent =
    new Date().getFullYear();
