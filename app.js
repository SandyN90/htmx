









// HOMEPAGE benchmark
function getdata(){
	const resultList = document.getElementById('reslist')
	const resultlistFilter = document.getElementById('reslistfilter')

	const fileLocation = `/masterdata.json`

	fetch(fileLocation)
	.then(response => {
		if(!response.ok){
			throw new Error('Error fetching masterdata.json')
		}
		return response.json()
	})
	.then(jsonData => {
		console.log('data', jsonData)

		jsonData.sort((a, b) => new Date(b.meta.isoTimestamp) - new Date(a.meta.isoTimestamp));

		let categoriesSet = new Set();
		let yearSet = new Set();
		let monthSet = new Set();
		let tldSet = new Set();


		const yearDropdown = document.getElementById('yearDropdown');
		const monthDropdown = document.getElementById('monthDropdown');
		const tldDropdown = document.getElementById('tldDropdown');

        // jsonData.forEach(entry => {
        //     let category = entry.meta.cat;
        //     categoriesSet.add(category);
        // });
		

		jsonData.forEach(entry => {
			let category = entry.meta.cat;
			categoriesSet.add(category);
			
			const entryDate = new Date(entry.meta.isoTimestamp);
			yearSet.add(entryDate.getFullYear());
			monthSet.add(entryDate.getMonth() + 1); // +1 because months are 0-11
			let tld = entry.meta.tld;
			tldSet.add(tld);
		});

        categoriesSet.forEach(category => {
            let option = document.createElement('option');
            option.value = category;
            option.innerText = category;
            categoryDropdown.appendChild(option);
        });

				// Populate the year dropdown
		yearSet.forEach(year => {
			let option = document.createElement('option');
			option.value = year;
			option.innerText = year;
			yearDropdown.appendChild(option);
		});

		// Populate the month dropdown
		monthSet.forEach(month => {
			let option = document.createElement('option');
			option.value = month;
			// option.innerText = month; // or some array of month names like ["Jan", "Feb", ...][month - 1]
			const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// If 'month' is a number between 1 to 12:
option.innerText = monthNames[month - 1];

			monthDropdown.appendChild(option);
		});

		tldSet.forEach(tld => {
			let option = document.createElement('option');
			option.value = tld;
			option.innerText = tld;
			tldDropdown.appendChild(option);
		});

        renderList(jsonData, '');

        categoryDropdown.addEventListener('change', function() {
            const selectedCategory = this.value;
			renderList(jsonData, categoryDropdown.value, yearDropdown.value, monthDropdown.value, tldDropdown.value);
        });
 		
		yearDropdown.addEventListener('change', function() {
			renderList(jsonData, categoryDropdown.value, yearDropdown.value, monthDropdown.value, tldDropdown.value);
		});
		
		monthDropdown.addEventListener('change', function() {
			renderList(jsonData, categoryDropdown.value, yearDropdown.value, monthDropdown.value, tldDropdown.value);
		});

		tldDropdown.addEventListener('change', function() {
			renderList(jsonData, categoryDropdown.value, yearDropdown.value, monthDropdown.value, tldDropdown.value);
		});


		let currentSort = {
			field: null,
			direction: 'ASC'
			};

			function renderList(data, filterCategory, filterYear, filterMonth, tld, sortField) {

				/// Better to sort source data....to
				// data = [...data].sort((a, b) => b.meta.isoTimestamp.localeCompare(a.meta.isoTimestamp));

				const resultList = document.getElementById('reslist');

				if (tld && tld !== '') {
					data = data.filter(entry => entry.meta.tld === tld);
				}
			
				if (sortField) {
					data = [...data];
					if (typeof data[0].meta[sortField] === 'string') { // Check if the field contains strings
						if (currentSort.direction === 'ASC') {
							data.sort((a, b) => a.meta[sortField].localeCompare(b.meta[sortField]));
						} else {
							data.sort((a, b) => b.meta[sortField].localeCompare(a.meta[sortField]));
						}
					} else { // Assume numbers if not strings
						if (currentSort.direction === 'ASC') {
							data.sort((a, b) => a.meta[sortField] - b.meta[sortField]);
						} else {
							data.sort((a, b) => b.meta[sortField] - a.meta[sortField]);
						}
					}
				}

				// Clear the existing list
				resultList.innerHTML = '';
				let htmlTableHeadHtml = `
				<div id="sortSite" class="1flex-1 w-48 font-semibold text-xs md:text-sm sm:text-xs lg:text-base  text-center">Site	</div>
				<span id="sortUrls" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base  text-center">#Urls	</span>
				<span id="sortDate" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base hidden md:block text-center">Date	</span>
				<span id="sortCategory" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base hidden md:block text-center">Category	</span>
				<span id="sortCritical" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base  text-center">Critical	</span>
				<span id="sortSerious" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base  text-center">Serious	</span>
				<span id="sortModerate" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base hidden md:block text-center">Moderate	</span>
				<span id="sortMinor" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base hidden md:block text-center">Minor	</span>
				<span id="sortTotal" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base hidden md:block text-center">Total</span>
				<span id="sortPercentage" class="flex-1 font-semibold text-xs md:text-sm sm:text-xs lg:text-base hidden md:block text-center">Error%</span>
				
				`
				let htmlTableHeadElement = document.createElement('li')
				htmlTableHeadElement.classList = `flex justify-between w-full sticky top-0 bg-[#1f2937] py-2   text-white`
				htmlTableHeadElement.innerHTML = htmlTableHeadHtml

				
				resultList.append(htmlTableHeadElement)
				const headers = document.querySelectorAll('[id^="sort"]');
				headers.forEach(header => {
					header.addEventListener('click', function() {
						console.log('click', header )
						let sortValue;
				
						switch (this.id) {
							case 'sortSite':
								sortValue = 'domainname'; // You'll need to define what value corresponds to sorting by Site
								break;
							case 'sortUrls':
								sortValue = 'totalUrls'; // and likewise for the other values.
								break;
							case 'sortDate':
								sortValue = 'isoTimestamp';
								break;
							case 'sortCategory':
								sortValue = 'cat';
								break;
							case 'sortCritical':
								sortValue = 'impactCountsCritical';
								break;
							case 'sortSerious':
								sortValue = 'impactCountsSerious';
								break;
							case 'sortModerate':
								sortValue = 'impactCountsModerate';
								break;
							case 'sortMinor':
								sortValue = 'impactCountsMinor';
								break;
							case 'sortTotal':
								sortValue = 'totalViolationsCount';
								break;
							case 'sortPercentage':
								sortValue = 'errorPercentage';
								break;
							default:
								sortValue = 'errorPercentage'; // default sort if no match
						}


						   // Toggle the sort direction if the same field is clicked again, otherwise set to ASC
						   if (currentSort.field === sortValue) {
							currentSort.direction = (currentSort.direction === 'ASC') ? 'DESC' : 'ASC';
						} else {
							currentSort.field = sortValue;
							currentSort.direction = 'ASC';
						}

					 // Sorting the data based on the current sort configuration
					 if (typeof jsonData[0].meta[currentSort.field] === 'string') { 
						if (currentSort.direction === 'ASC') {
							jsonData.sort((a, b) => a.meta[currentSort.field].localeCompare(b.meta[currentSort.field]));
						} else {
							jsonData.sort((a, b) => b.meta[currentSort.field].localeCompare(a.meta[currentSort.field]));
						}
					} else { 
						if (currentSort.direction === 'ASC') {
							jsonData.sort((a, b) => a.meta[currentSort.field] - b.meta[currentSort.field]);
						} else {
							jsonData.sort((a, b) => b.meta[currentSort.field] - a.meta[currentSort.field]);
						}
					}
				
						  renderList(jsonData, categoryDropdown.value, yearDropdown.value, monthDropdown.value, tldDropdown.value);
						});
				});

				data.forEach(entry => {

					const entryDate = new Date(entry.meta.isoTimestamp);
					const entryYear = entryDate.getFullYear().toString();
					const entryMonth = (entryDate.getMonth() + 1).toString(); // +1 because months are 0-11
					
					const shouldDisplayBasedOnCategory = !filterCategory || entry.meta.cat === filterCategory;
					const shouldDisplayBasedOnYear = !filterYear || entryYear === filterYear;
					const shouldDisplayBasedOnMonth = !filterMonth || entryMonth === filterMonth;
			
					if (shouldDisplayBasedOnCategory && shouldDisplayBasedOnYear && shouldDisplayBasedOnMonth) {
				 

					if (!filterCategory || entry.meta.cat === filterCategory) {
						let listItem = document.createElement('li')
						listItem.classList = `flex justify-between w-full hover:bg-gray-200 border-b py-1`
						let meta = entry.meta;

								// Update values if they are null ///////////////Should really be deleting the folder and creating errormsg.
								if (meta.averageElementsPerPage === null) {
									meta.averageElementsPerPage = 0;
								}
								if (meta.averageErrorPerPage === null) {
									meta.averageErrorPerPage = 0;
								}
								if (meta.errorPercentage === null) {
									meta.errorPercentage = 0;
								}
								// Update domainname if it's an empty string
								if (meta.domainname === "") {
									meta.domainname = meta.domainfolder + ' error';
								}
								if (meta.cat === undefined) {
									meta.cat = '-';
								}
								function extractDomain(url) {
									// Remove http:// or https://
									url = url.replace(/^https?:\/\//, '');
									url = url.replace(/^www\./, '');
								  	return url.split('/')[0];
								  }
						
					
						let totalViolationsCount = meta.totalViolationsCount
						// let errorPercentage = meta.errorPercentage
						let errorPercentage = parseFloat(meta.errorPercentage.toFixed(2));

						let impactCountsCritical = meta.impactCountsCritical
						let impactCountsSerious = meta.impactCountsSerious
						let impactCountsModerate = meta.impactCountsModerate
						let impactCountsMinor = meta.impactCountsMinor

						let impactColors = {
							impactCountsCritical: impactCountsCritical !== 0 ? "red" : "inherit",
							impactCountsSerious: impactCountsSerious !== 0 ? "orange" : "inherit",
							impactCountsModerate: impactCountsModerate !== 0 ? "yellow" : "inherit",
							impactCountsMinor: impactCountsMinor !== 0 ? "lightblue" : "inherit" // I chose light blue for "minor", but you can change this to any other color.
						};

						function formatDateShort(dateString) {
							let parts = dateString.split(" "); // Split string by space
							parts[0] = parts[0].substring(0, 3) + "."; // Take the first 3 characters and add a period
							return parts.join(" "); // Join the parts back together
						}

						let numUrls = meta.totalUrls
						let ss = meta.screenshot
						let runname = extractDomain(meta.domainname)
						let daterunned = formatDateShort(meta.readableDate)
						let cat = meta.cat
						let runlink = `/a11y/${meta.domainfolder}`;
						// let isoTimeStamp = meta.isoTimestamp
						// meta.sort((a, b) => new Date(b.isoTimeStamp) - new Date(a.isoTimeStamp));
						
						// let listItemHtml = `<a href="${runlink}">${runname}</a> with ${numUrls} urls // (on ${daterunned})`
						let listItemHtml = `
						<span class="hover-container">
							<a href="${runlink}" class="text-xs w-48 md:text-sm sm:text-xs lg:text-base 1flex-1 text-center block">${runname}</a>
							<img src="${ss}" class="screenshot">
						</span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 text-center">${numUrls}   </span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 hidden md:block text-center">${daterunned}</span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 hidden md:block text-center">${cat}</span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 text-center" style="color:${impactColors.impactCountsCritical}"> ${impactCountsCritical}</span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 text-center" style="color:${impactColors.impactCountsSerious}"> ${impactCountsSerious}</span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 hidden md:block text-center" style="color:${impactColors.impactCountsModerate}"> ${impactCountsModerate}</span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 hidden md:block text-center" style="color:${impactColors.impactCountsMinor}"> ${impactCountsMinor}</span>
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 hidden md:block text-center"> ${totalViolationsCount}</span> 
						<span  class="text-xs md:text-sm sm:text-xs lg:text-base flex-1 hidden md:block text-center"> ${errorPercentage}%</span>
						`;

						listItem.innerHTML = listItemHtml
						resultList.append(listItem)

						// Output or process the link as needed
						console.log(runlink);

				

					} // end If !FilterCategory

				}




				});
			} // end renderList

			document.getElementById("resetButton").addEventListener("click", function() {
				// Reset dropdowns to their default values
				document.getElementById("categoryDropdown").value = ""; // Assuming default value is an empty string
				document.getElementById("yearDropdown").value = "";    // Modify as needed
				document.getElementById("monthDropdown").value = "";
				
				// Reset any other filters or sorts you have
				// ...
			
				// Refresh the display
				renderList(jsonData);  // Assuming displayData is the function you use to display your data
			});
			

	}) /// end .then
	.catch(error => {
		console.error(`There was a problem fetching masterdata json`)
	})
	

} 

getdata()