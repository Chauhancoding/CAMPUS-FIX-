const form = document.getElementById("problemForm");
const list = document.getElementById("problemList");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    const problem = document.createElement("div");
    problem.className = "problem";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const type = document.createElement("p");
    type.textContent = "Category: " + category;

    const detail = document.createElement("p");
    detail.textContent = description;

    const status = document.createElement("p");
    status.textContent = "Status: Pending";

    problem.append(heading, type, detail, status);
    list.appendChild(problem);

    form.reset();
});