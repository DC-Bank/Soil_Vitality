const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
const dataTableHead = document.getElementById('dataTable').getElementsByTagName('thead')[0];
const saveButton = document.getElementById('saveButton');
const clearButton = document.getElementById('clearButton');
const clientSelect = document.querySelector('select');

const clientDataMap = {}; // To store tables and states for each client

uploadBox.addEventListener('click', () => {
    fileInput.click();
});

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#3d8b1e';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = '#56ab2f';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

saveButton.addEventListener('click', () => {
    const selectedClient = clientSelect.value;

    if (!selectedClient) {
        alert('Please select a client number before saving.');
        return;
    }

    const data = [];
    const rows = dataTable.querySelectorAll('tr');

    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('input').forEach(input => {
            rowData.push(input.value.trim());
        });
        data.push(rowData);
    });

    clientDataMap[selectedClient] = {
        headers: Array.from(dataTableHead.querySelectorAll('th')).map(th => th.textContent),
        rows: data
    };

    alert(`Data has been saved for Client ${selectedClient}`);
    uploadBox.style.display = 'none'; // Hide the upload box
    document.querySelector('.table-section').classList.add('table-top'); // Move table to the top
});

clearButton.addEventListener('click', () => {
    // Always clear the table and file input, regardless of whether data is saved
    clearTable();

    // Reset UI elements
    uploadBox.style.display = 'block'; // Show the upload box
    document.querySelector('.table-section').classList.remove('table-top'); // Reset table position

    
});


clientSelect.addEventListener('change', () => {
    const selectedClient = clientSelect.value;

    if (selectedClient) {
        if (clientDataMap[selectedClient]) {
            // Load saved client data
            loadTable(clientDataMap[selectedClient]);
            uploadBox.style.display = 'none';
            document.querySelector('.table-section').classList.add('table-top'); // Ensure table is positioned correctly
        } else {
            // Execute "clear data" functionality
            clearTable();
            uploadBox.style.display = 'block';
            document.querySelector('.table-section').classList.remove('table-top');
        }
    }
});

function clearTable() {
    dataTable.innerHTML = '';
    dataTableHead.innerHTML = '';
    fileInput.value = '';
    uploadBox.style.borderColor = '#56ab2f';
}

function loadTable(clientData) {
    if (!clientData) return;

    clearTable();

    // Populate headers
    const headerRow = document.createElement('tr');
    clientData.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    dataTableHead.appendChild(headerRow);

    // Populate rows
    clientData.rows.forEach(rowData => {
        const tr = document.createElement('tr');
        rowData.forEach(cellData => {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = cellData;
            adjustInputWidth(input);
            td.appendChild(input);
            tr.appendChild(td);
        });
        dataTable.appendChild(tr);
    });
}

function handleFiles(files) {
    const file = files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            populateTable(jsonData);
        };
        reader.readAsBinaryString(file);
    }
}

function populateTable(data) {
    clearTable();

    const headerKeywords = ["K", "CA", "Mg", "NA"];
    let headerRowIndex = data.findIndex(row => row.some(cell => headerKeywords.includes((cell || '').toString().toUpperCase())));
    if (headerRowIndex === -1) {
        alert("No valid header row found in the uploaded file.");
        return;
    }

    const headerRow = document.createElement('tr');
    const headers = data[headerRowIndex];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header || '';
        headerRow.appendChild(th);
    });
    dataTableHead.appendChild(headerRow);

    const columnCount = headers.length;
    data.slice(headerRowIndex + 1).forEach(row => {
        const tr = document.createElement('tr');
        for (let colIndex = 1; colIndex < columnCount; colIndex++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = row[colIndex] || '';
            adjustInputWidth(input);
            td.appendChild(input);
            tr.appendChild(td);
        }
        dataTable.appendChild(tr);
    });
}

function adjustInputWidth(input) {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    span.style.position = 'absolute';
    span.style.font = getComputedStyle(input).font;
    span.textContent = input.value || ' ';
    document.body.appendChild(span);
    input.style.width = `${span.offsetWidth + 5}px`;
    document.body.removeChild(span);
}
