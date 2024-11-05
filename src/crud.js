const fs = require('fs');
const path = require('path');
const fileList = document.getElementById('fileList');

const btnCreate = document.getElementById('btnCreate');
const btnUpdate = document.getElementById('btnUpdate');
const btnDelete = document.getElementById('btnDelete');
const fileName = document.getElementById('fileName');
const fileContents = document.getElementById('fileContents');
const countryName = document.getElementById('countryName');
const fileTips = document.getElementById('fileTips'); // Textarea to display tips

const pathName = path.join(__dirname, 'Files');

// Load existing files on startup
function loadFiles() {
    fs.readdir(pathName, (err, files) => {
        if (err) return console.log("Error reading directory:", err);

        fileList.innerHTML = ""; // Clear the list
        files.forEach(file => {
            const filePath = path.join(pathName, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) return console.log("Error reading file:", err);

                const fileData = JSON.parse(data);
                const li = document.createElement('li');
                li.textContent = `${fileData.name} - country: ${fileData.country} - activities: ${fileData.activities}`;
                li.addEventListener('click', () => loadFileContent(file));
                fileList.appendChild(li);
            });
        });
    });
}

// Load file content into form
function loadFileContent(file) {
    const filePath = path.join(pathName, file);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return console.log("Error reading file:", err);

        const fileData = JSON.parse(data);
        fileName.value = fileData.name;
        countryName.value = fileData.country;
        fileContents.value = fileData.activities;
        fileTips.value = fileData.tips.join('\n'); // Display tips in textarea
    });
}

// Fetch personalized tips from REST Countries API
function generateTips(country) {
    return fetch(`https://restcountries.com/v3.1/name/${country}`)
        .then(response => response.json())
        .then(data => {
            const countryData = data[0];
            const currency = Object.keys(countryData.currencies)[0];
            const language = Object.values(countryData.languages || {})[0];
            const carSide = countryData.car.side;
            const startOfWeek = countryData.startOfWeek;
            const timeZone = countryData.timezones ? countryData.timezones[0] : "N/A"; // Display first timezone if multiple
            const countryCode = countryData.cca2; // Use 2-letter country code

            return [
                `1. Make sure to exchange your currency in ${currency}.`,
                `2. Learn basic phrases in ${language}.`,
                `3. Drive on the ${carSide} side of the road.`,
                `4. The week starts on ${startOfWeek}.`,
                `5. The country code is ${countryCode}.`,
                `6. The time zone is ${timeZone}.`
            ];
        });
}


// Create a new file with tips included
btnCreate.addEventListener('click', async () => {
    const file = fileName.value.trim();
    const country = countryName.value.trim();
    const activities = fileContents.value.trim();

    if (!file || !country || !activities) {
        alert("Please fill out all fields before creating a new wishlist.");
        return;
    }

    const tips = await generateTips(country);

    const wishlist = {
        name: file,
        country: country,
        activities: activities,
        tips: tips
    };

    const filePath = path.join(pathName, `${file}.json`);

    fs.writeFile(filePath, JSON.stringify(wishlist), (err) => {
        if (err) return console.log("Error creating file:", err);

        alert(`${fileName.value} was created successfully!`);
        loadFiles(); // Refresh the file list
    });
});

// Update an existing file with updated tips
btnUpdate.addEventListener('click', async () => {
    if (!fileName.value) {
        alert("Please provide a file name to update.");
        return;
    }

    const tips = await generateTips(countryName.value);

    const wishlist = {
        name: fileName.value,
        country: countryName.value,
        activities: fileContents.value,
        tips: tips
    };

    const filePath = path.join(pathName, `${wishlist.name}.json`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            alert("File does not exist. Please create it first.");
            return;
        }

        fs.writeFile(filePath, JSON.stringify(wishlist), (err) => {
            if (err) return console.log("Error updating file:", err);

            alert(`${wishlist.name} was updated successfully!`);
            loadFiles(); // Refresh the file list
        });
    });
});

// Delete a file
btnDelete.addEventListener('click', () => {
    const filePath = path.join(pathName, `${fileName.value}.json`);

    const isConfirmed = confirm("Are you sure you want to delete this file?");
    if (!isConfirmed) {
        return;
    }

    fs.unlink(filePath, (err) => {
        if (err) return console.log("Error deleting file:", err);

        alert(`${fileName.value} was deleted successfully!`);
        fileName.value = "";
        countryName.value = "";
        fileContents.value = "";
        fileTips.value = ""; // Clear tips display
        loadFiles(); // Refresh the file list
    });
});

// Initialize by loading existing files
loadFiles();
