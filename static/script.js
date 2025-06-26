function uploadFile() {
    let fileInput = document.getElementById('fileUpload');
    let file = fileInput.files[0];

    if (!file) {
        alert("Please upload a file!");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("text-data").innerText = data.text_data;
        generateCharts(data.production_data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function generateCharts(data) {
    let lantaburData = data["Lantabur"].map(item => item[1]);
    let lantaburLabels = data["Lantabur"].map(item => item[0]);

    let taqwaData = data["Taqwa"].map(item => item[1]);
    let taqwaLabels = data["Taqwa"].map(item => item[0]);

    new Chart(document.getElementById('lantaburChart'), {
        type: 'pie',
        data: {
            labels: lantaburLabels,
            datasets: [{
                label: 'Lantabur Production',
                data: lantaburData,
                backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'],
            }]
        }
    });

    new Chart(document.getElementById('taqwaChart'), {
        type: 'bar',
        data: {
            labels: taqwaLabels,
            datasets: [{
                label: 'Taqwa Production',
                data: taqwaData,
                backgroundColor: '#007bff',
            }]
        }
    });
}
