		const uploadBox = document.getElementById('uploadBox');
        const fileInput = document.getElementById('fileInput');
        const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
        const dataTableHead = document.getElementById('dataTable').getElementsByTagName('thead')[0];
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
        function handleFiles(files) {
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
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
    // Clear previous table content
    dataTable.innerHTML = '';
    dataTableHead.innerHTML = '';
    // Find the header row containing soil analysis elements
    const headerKeywords = ["K", "CA", "Mg", "NA"];
    let headerRowIndex = data.findIndex(row => row.some(cell => headerKeywords.includes((cell || '').toString().toUpperCase())));
    if (headerRowIndex === -1) {
        alert("No valid header row found in the uploaded file.");
        return;
    }
    // Create headers from the identified header row
    const headerRow = document.createElement('tr');
    const headers = data[headerRowIndex];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header || ''; // Use blank if header cell is empty
        headerRow.appendChild(th);
    });
    dataTableHead.appendChild(headerRow);
    // Process rows ensuring alignment with header columns
    const columnCount = headers.length;
    data.slice(headerRowIndex + 1).forEach(row => {
        const tr = document.createElement('tr');
        for (let colIndex = 1; colIndex < columnCount; colIndex++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';

            // Set the input value
            input.value = row[colIndex] || ''; // Assign cell value or blank

            // Adjust input size based on content length
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

    // Set input width based on span width
    input.style.width = `${span.offsetWidth + 5}px`; // Add padding for comfort
    document.body.removeChild(span);
}