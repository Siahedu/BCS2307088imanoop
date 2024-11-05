// Function for the search button on index.html
function buttonclicked() {
    const input = document.getElementById("input").value.trim();
    document.getElementById('demo').innerHTML = "Loading...";

    const endpoints = [
        `https://restcountries.com/v3.1/name/${input}`,
        `https://restcountries.com/v3.1/lang/${input}`,
        `https://restcountries.com/v3.1/demonym/${input}`,
        `https://restcountries.com/v3.1/capital/${input}`,
        `https://restcountries.com/v3.1/region/${input}`,
        `https://restcountries.com/v3.1/subregion/${input}`,
        `https://restcountries.com/v3.1/translation/${input}`,
        `https://restcountries.com/v3.1/alpha/${input}`,

    ];

    let found = false;

    (async () => {
        for (let url of endpoints) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Country not found");

                const data = await response.json();
                const country = data[0];

                // Extract details
                const latitude = country.latlng[0];
                const longitude = country.latlng[1];
                const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 5}%2C${latitude - 5}%2C${longitude + 5}%2C${latitude + 5}&amp;layer=mapnik`;

                const capital = country.capital ? country.capital[0] : "N/A";
                const currencyKey = country.currencies ? Object.keys(country.currencies)[0] : "N/A";
                const currencySymbol = country.currencies ? country.currencies[currencyKey].symbol : "N/A";
                const currency = currencyKey !== "N/A" ? `${currencyKey} (${currencySymbol})` : "N/A";

                // Display country details
                document.getElementById('demo').innerHTML = `
                    <img src="${country.flags.png}" alt="Flag of ${country.name.official}" style="width:250px;"/>
                    <p><strong>Coat of Arms:</strong></p>
                    <img src="${country.coatOfArms.png}" alt="Coat of Arms of ${country.name.common}" style="width: 100px"/>
                    <p><strong>Area:</strong> ${country.area.toLocaleString()} km²</p>
                    <h2>${country.name.official}</h2>
                    <p>Region: ${country.region}</p>
                    <p>Subregion: ${country.subregion}</p>
                    <p>Population: ${country.population.toLocaleString()}</p>
                    <p>Capital: ${capital}</p>
                    <p>Currency: ${currency}</p>
                    <button class="map-button"><a style=" text-decoration: none; color:white;" href="${country.maps.googleMaps}" target="_blank">View on Google Maps</a></button>
                    <button class="map-button"><a style=" text-decoration: none; color:white;" href="${country.maps.openStreetMaps}" target="_blank">View on OpenStreetMap</a></button>
                    
                    <center>
                    <iframe src="${mapUrl}" style="width: 600px; height: 450px; border: 1px solid black"></iframe>
                    <p><strong>Time Zones:</strong> ${country.timezones.join(', ')}</p>
                    </center><br><br>
                `;

                // Fetch and display bordering countries
                if (country.borders && country.borders.length > 0) {
                    await fetchBorderingCountries(country.borders);
                } else {
                    document.getElementById('demo').innerHTML += "<p>No bordering countries available.</p>";
                }

                found = true;
                break; // Exit the loop if a country is found
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        if (!found) {
            document.getElementById('demo').innerHTML = `
                <img src="2.png" alt="Error Image" style="width: 200px; height: auto;">
                <center>Country not found or error occurred.</center>
            `;
        }
    })();
}



// Fetch and display regions and subregions from the REST Countries API
async function fetchAndDisplayRegions() {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const countries = await response.json();

    // Object to store unique regions and their corresponding subregions
    const regions = {};

    // Organize regions and subregions
    countries.forEach(country => {
        const region = country.region || "Other";
        const subregion = country.subregion || "Unspecified";

        // Initialize region if not already added
        if (!regions[region]) {
            regions[region] = new Set();
        }

        // Add subregion to the region's set (avoids duplicates)
        regions[region].add(subregion);
    });

    // Generate HTML structure for displaying regions and subregions
    const regionListContainer = document.createElement('div');
    regionListContainer.classList.add('region-list');

    for (const [region, subregions] of Object.entries(regions)) {
        const regionItem = document.createElement('div');
        regionItem.classList.add('region-item');

        const regionTitle = document.createElement('h3');
        regionTitle.textContent = region;
        regionItem.appendChild(regionTitle);

        const subregionList = document.createElement('ul');
        subregions.forEach(subregion => {
            const subregionItem = document.createElement('li');
            subregionItem.textContent = subregion;
            subregionList.appendChild(subregionItem);
        });

        regionItem.appendChild(subregionList);
        regionListContainer.appendChild(regionItem);
    }

    // Append the generated HTML to the desired location on the page
    document.querySelector('.info-box').appendChild(regionListContainer);
}

// Run the function to fetch and display regions on page load
document.addEventListener('DOMContentLoaded', fetchAndDisplayRegions);


// Function to fetch and display bordering countries based on `borders` field
async function fetchBorderingCountries(borders) {
    try {
        const borderCountriesData = await Promise.all(
            borders.map(borderCode => 
                fetch(`https://restcountries.com/v3.1/alpha/${borderCode}`).then(response => response.json())
            )
        );

        let nearbyHtml = '<h3>Bordering Countries:</h3><ul>';
        borderCountriesData.forEach(borderCountryData => {
            const borderCountry = borderCountryData[0]; // Data is an array, so take the first element
            nearbyHtml += `
                <li>
                    <strong>${borderCountry.name.common}</strong>
                    <img src="${borderCountry.flags.png}" alt="Flag of ${borderCountry.name.common}" style="width:50px;"/>
                </li>`;
        });
        nearbyHtml += '</ul>';

        document.getElementById('demo').innerHTML += nearbyHtml;
    } catch (error) {
        console.error("Error fetching bordering countries:", error);
        document.getElementById('demo').innerHTML += `<p>Bordering countries not available.</p>`;
    }
}





// Function to display regions with a limit of 5 countries per scroll
function displayRegions() {
    const regions = ['africa', 'americas', 'asia', 'europe', 'oceania'];
    const countriesPerScroll = 5; // Now used to limit displayed countries per scroll

    regions.forEach(region => {
        fetch(`https://restcountries.com/v3.1/region/${region}`)
            .then(response => {
                if (!response.ok) throw new Error('Region not found');
                return response.json();
            })
            .then(data => {
                const countries = data.slice(0, 1000); // Fetch a maximum of 15 countries for simplicity
                let currentIndex = 0; // Track the current position

                const regionContainer = document.createElement('div');
                regionContainer.classList.add('region-container');

                regionContainer.innerHTML = `
                    <h2>${region.charAt(0).toUpperCase() + region.slice(1)} Region</h2>
                    <div class="scroll-container">
                        <button class="scroll-btn" onclick="scrollLeft('${region}-row')">&#10094</button>
                        <div class="countries-row" id="${region}-row"></div>
                        <button class="scroll-btn" onclick="scrollRight('${region}-row')">&#10095;</button>
                    </div>
                `;
                const row = regionContainer.querySelector('.countries-row');

                // Display the first set of countries
                updateCountryDisplay(row, countries, currentIndex, countriesPerScroll);
                
                // Attach event listeners to scroll buttons
                regionContainer.querySelector('.scroll-btn:first-child').onclick = () => {
                    currentIndex = Math.max(currentIndex - countriesPerScroll, 0);
                    updateCountryDisplay(row, countries, currentIndex, countriesPerScroll);
                };
                regionContainer.querySelector('.scroll-btn:last-child').onclick = () => {
                    currentIndex = Math.min(currentIndex + countriesPerScroll, countries.length - countriesPerScroll);
                    updateCountryDisplay(row, countries, currentIndex, countriesPerScroll);
                };

                document.getElementById('demo1').appendChild(regionContainer);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                document.getElementById('demo1').innerHTML = `
                    <img src="Designer.png" alt="Error Image" style="width: 100px; height: auto;">
                    <p>Region not found or error occurred.</p>`;
            });
    });
}

// Helper function to update displayed countries based on current index and limit
function updateCountryDisplay(container, countries, startIndex, limit) {
    container.innerHTML = ''; // Clear previous items
    const endIndex = Math.min(startIndex + limit, countries.length);
    for (let i = startIndex; i < endIndex; i++) {
        const country = countries[i];
        const countryDiv = document.createElement('div');
        countryDiv.classList.add('country-info');
        countryDiv.onclick = () => viewCountryDetails(country.name.common);
        countryDiv.innerHTML = `
            <img src="${country.flags.png}" alt="Flag of ${country.name.common}" />
            <h3>${country.name.common}</h3>
            <p>Official Name: ${country.name.official}</p>
        `;
        container.appendChild(countryDiv);
    }
}



// Function to store selected country in sessionStorage and navigate to details page
function viewCountryDetails(countryName) {
    sessionStorage.setItem('selectedCountry', countryName);
    window.location.href = 'country_detail.html';
}

// Function to calculate the distance between two sets of lat/lng coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Display country details on country_details.html
function displayCountryDetails() {
    const countryName = sessionStorage.getItem('selectedCountry');

    if (countryName) {
        fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then(response => response.json())
            .then(data => {
                const country = data[0];
                document.getElementById('country-name').innerText = country.name.common;
                
                const latitude = country.latlng[0];
                const longitude = country.latlng[1];
                const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 5}%2C${latitude - 5}%2C${longitude + 5}%2C${latitude + 5}&amp;layer=mapnik`;

                let details = `
                    <center><img src="${country.flags.png}" alt="Flag of ${country.name.common}" /></center>
                    <p><strong>Coat of Arms:</strong> ${country.coatOfArms.png ? `<img src="${country.coatOfArms.png}" alt="Coat of Arms of ${country.name.common}" style="width: 100px"/>` : "N/A"}</p>
                    <p><strong>Area:</strong> ${country.area.toLocaleString()} km²</p>
                    <p><strong>Official Name:</strong> ${country.name.official}</p>
                    <p><strong>Independence:</strong> ${country.independent ? "Yes" : "No"}</p>
                    <p><strong>Time Zones:</strong> ${country.timezones.join(', ')}</p>
                    <center><button style="text-decoration: none; color:white;" class="back-button"><a href="${country.maps.googleMaps}" target="_blank">View on Google Maps</a></button>
                    <button style="text-decoration: none; color:white; margin:10px" class="back-button"><a href="${country.maps.openStreetMaps}" target="_blank">View on OpenStreetMap</a></button></center>
                    <iframe src="${mapUrl}" style="width: 600px; height: 450px; border: 1px solid black"></iframe>
                    <p><strong>Region:</strong> ${country.region}</p>
                    <p><strong>Subregion:</strong> ${country.subregion || "N/A"}</p>
                    <p><strong>Population:</strong> ${country.population.toLocaleString()} people</p>
                    <p><strong>Currency:</strong> ${country.currencies ? Object.keys(country.currencies)[0] : "N/A"}</p>
                    <p><strong>Languages:</strong> ${Object.values(country.languages || {}).join(', ')}</p>
                `;

                document.getElementById('country-details').innerHTML = details;

                // Bordering countries
                if (country.borders && country.borders.length > 0) {
                    const borderPromises = country.borders.map(borderCode =>
                        fetch(`https://restcountries.com/v3.1/alpha/${borderCode}`)
                            .then(response => response.json())
                            .then(borderData => {
                                const borderCountry = borderData[0];
                                const distance = calculateDistance(latitude, longitude, borderCountry.latlng[0], borderCountry.latlng[1]);
                                return `
                                    <li>
                                        <img src="${borderCountry.flags.png}" alt="Flag of ${borderCountry.name.common}" style="width: 30px; height: 20px; vertical-align: middle; margin-right: 5px;">
                                        ${borderCountry.name.common} - ${distance.toFixed(1)} km away
                                    </li>
                                `;
                            })
                    );

                    Promise.all(borderPromises).then(borderCountriesHtml => {
                        document.getElementById('country-details').innerHTML += `
                            <h3>Bordering Countries:</h3>
                            <ul>${borderCountriesHtml.join('')}</ul>
                        `;
                    });
                } else {
                    document.getElementById('country-details').innerHTML += `<p>No bordering countries.</p>`;
                }
            })
            .catch(error => {
                console.error("Error fetching country details:", error);
                document.getElementById('country-details').innerHTML = `<p>Details not available.</p>`;
            });
    } else {
        document.getElementById('country-details').innerHTML = `<p>Country not selected.</p>`;
    }
}

// Function to calculate the distance between two sets of lat/lng coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


function displayPersonalizedTips(country) {
    // Accessing the currency and language safely
    const currency = country.currencies ? Object.keys(country.currencies)[0] : "N/A";
    const language = country.languages ? Object.values(country.languages)[0] : "N/A";
    const carSide = country.car && country.car.side ? country.car.side : "unknown";
    const countryCode = country.cca2; // Use 2-letter country code
    const timeZone = country.timezones ? country.timezones[0] : "N/A"; // Display first timezone if multiple

    // Generating the tips
    const tips = `
        <h3>Personalized Travel Tips</h3>
        <ul>
            <li>Make sure to have enough currency in ${currency}.</li>
            <li>Learn basic phrases in ${language}.</li>
            <li>Remember, they drive on the ${carSide} side of the road.</li>
            <li>The country code is ${countryCode}.</li>
            <li>The time zone is ${timeZone}.</li>
        </ul>
    `;

    // Displaying the tips in the HTML element
    document.getElementById('country-tips').innerHTML = tips;
}






// Run specific functions depending on the page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('demo')) {
        // We're on index.html
        displayRegions();
    } else if (document.getElementById('country-details')) {
        // We're on country_details.html
        displayCountryDetails();
    }
});




function storeCountryForWishlist(country) {
    sessionStorage.setItem('wishlistCountry', JSON.stringify({
        name: country.name.common,
        capital: country.capital ? country.capital[0] : "N/A",
        region: country.region,
        currency: country.currency,
    }));
}




