// Function to navigate to the details page and pass data to country_detail.html
function viewCountryDetails(countryName) {
    // Store the country name in sessionStorage to retrieve it on the details page
    sessionStorage.setItem('selectedCountry', countryName);
    // Navigate to the details page
    window.location.href = 'country_details.html';
}

window.addEventListener('DOMContentLoaded', () => {
    const countryName = sessionStorage.getItem('selectedCountry');

    if (countryName) {
        fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then(response => response.json())
            .then(data => {
                const country = data[0];
                document.getElementById('country-name').innerText = country.name.common;

                const itinerary = `
                    <img src="${country.flags.png}" alt="Flag of ${country.name.common}" />
                    <p><strong>Official Name:</strong> ${country.name.official}</p>
                    <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
                    <p><strong>Region:</strong> ${country.region}</p>
                    <p><strong>Subregion:</strong> ${country.subregion || "N/A"}</p>
                    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                    <p><strong>Currency:</strong> ${country.currencies ? Object.values(country.currencies)[0].name + " (" + Object.values(country.currencies)[0].symbol + ")" : "N/A"}</p>
                    <p><strong>Basic Language:</strong> ${Object.values(country.languages || {}).join(', ')}</p>
                    <p><strong>Car Side:</strong> ${country.car ? country.car.side : "N/A"}</p>
                    <p><strong>Timezone:</strong> ${country.timezones[0]}</p>
                    <p><strong>Flag Description:</strong> ${country.flags.alt}</p>
                `;

                document.getElementById('country-details').innerHTML = itinerary;
            })
            .catch(error => {
                console.error("Error fetching country details:", error);
                document.getElementById('country-details').innerHTML = `<p>Details not available.</p>`;
            });
    } else {
        document.getElementById('country-details').innerHTML = `<p>Country not selected.</p>`;
    }
});
