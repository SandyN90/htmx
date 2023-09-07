

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fsp = fs.promises;
const url = require('url');
const path = require('path');
const { DateTime } = require("luxon");
const app = express();
const port = 4000;
const options= {
	origin: 'http://localhost:5500/api/metadata',
}


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


/// API route for html filter
app.get('/api/metadata',cors(options), (req, res) => {
	fs.readFile(path.join(__dirname, '/masterdata.json'), 'utf8', (err, data) => {
	  if (err) {
		res.status(500).send('Server error');
		return;
	  }
	  res.json(JSON.parse(data));
	});
  });

  app.get('/api/metadata2', (req, res) => {
	console.log(req.query); // This will print the query parameters

	fs.readFile(path.join(__dirname, '/masterdata.json'), 'utf8', (err, fileData) => {
		if (err) {
			res.status(500).send('Error reading the file.');
			return;
		}

		let jsonData;
		try {
			jsonData = JSON.parse(fileData);
		} catch (parseErr) {
			res.status(500).send('Error parsing the JSON.');
			return;
		}
		let htmlResponse = '';
		try {

			if (req.query.sort) {					
				jsonData.sort((a, b) => {
					const valA = a.meta[req.query.sort] || "";
					const valB = b.meta[req.query.sort] || "";
			
					if (typeof valA === "string") {
						return req.query.order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
					}
					return req.query.order === 'desc' ? valB - valA : valA - valB;
				});
			}
			


			// Filtering
			if (req.query.yearMonth) {
				const [year, month] = req.query.yearMonth.split("-");
				jsonData = jsonData.filter(item => {
					const itemDate = new Date(item.meta.isoTimestamp);
					return itemDate.getFullYear() === parseInt(year) && itemDate.getMonth() === parseInt(month) - 1;
				});
			}

			if (req.query.tld) {
				jsonData = jsonData.filter(item => item.meta.tld === req.query.tld);
			}

			if (req.query.cat) {
				jsonData = jsonData.filter(item => item.meta.cat === req.query.cat);
			}

			if (req.query.sort === 'cat') {
				jsonData.sort((a, b) => {
					const catA = a.item?.meta?.cat || "";
					const catB = b.item?.meta?.cat || "";
					
					if (typeof catA !== 'string' || typeof catB !== 'string') {
						console.error('Unexpected value:', catA, catB);
						return 0;  // or some other fallback behavior
					}
					
					if (req.query.order === 'asc') {
						return catA.localeCompare(catB);
					} else {
						return catB.localeCompare(catA);
					}
				});
			  }
			// Constructing the HTML table rows
	
	for (let item of jsonData) {
		htmlResponse += `
		<tr>
			<td class="category">${item.meta.cat}</td>
			<td class="tld">${item.meta.tld}</td>
			<td>${item.meta.domainname}</td>
			<td>${item.meta.totalUrls}</td>
			<td class="yearMonth">${item.meta.isoTimestamp}</td>

			
			<!-- add other columns here -->
		</tr>`;
	}
		} catch (processErr) {
			console.error("Error processing the data:", processErr); 
			res.status(500).send('Error processing the data.');
			return;
		}

	// 	// res.json(jsonData);
	// 	htmlResponse = `
	// 	<tbody data-cat="${req.query.cat || ''}" data-tld="${req.query.tld || ''}">
	// 		${htmlResponse}
	// 	</tbody>
	// `;

		res.set('Content-Type', 'text/html');
		res.send(htmlResponse);

	});
});


app.get('/api/filters/cat', (req, res) => {
	fs.readFile(path.join(__dirname, '/masterdata.json'), 'utf8', (err, fileData) => {
		if (err) return res.status(500).send('Error reading the file.');
		
		const jsonData = JSON.parse(fileData);
		const uniqueCats = [...new Set(jsonData.map(item => item.meta.cat))];
		
		// Return as options for select dropdown
		res.send(uniqueCats.map(cat => `<option value="${cat}">${cat}</option>`).join(''));
	});
});
app.get('/api/filters/tld', (req, res) => {
	fs.readFile(path.join(__dirname, '/masterdata.json'), 'utf8', (err, fileData) => {
		if (err) return res.status(500).send('Error reading the file.');
		
		const jsonData = JSON.parse(fileData);
		const uniqueTld = [...new Set(jsonData.map(item => item.meta.tld))];
		
		// Return as options for select dropdown
		res.send(uniqueTld.map(tld => `<option value="${tld}">${tld}</option>`).join(''));
	});
});
app.get('/api/filters/yearMonth', (req, res) => {
	fs.readFile(path.join(__dirname, '/masterdata.json'), 'utf8', (err, fileData) => {
		if (err) return res.status(500).send('Error reading the file.');

		const jsonData = JSON.parse(fileData);

		// Create a Set to store unique year-month combinations.
		let uniqueYearMonths = new Set();

		jsonData.forEach(item => {
			const itemDate = new Date(item.meta.isoTimestamp);
			// Format: YYYY-MM
			uniqueYearMonths.add(`${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`);
		});

		// Convert Set back to an array and return options.
		res.send([...uniqueYearMonths].map(yearMonth => `<option value="${yearMonth}">${yearMonth}</option>`).join(''));
	});
});








app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
  });
  