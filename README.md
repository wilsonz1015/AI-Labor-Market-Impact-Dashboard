# AI Occupation Impact Dashboard

Files:
- `index.html` - page structure and methodology shell
- `assets/styles.css` - styling
- `assets/app.js` - dashboard logic, rendering, filtering, sorting, drill-downs, and score calculations
- `data/dashboard-data.js` - occupation/task/labor score data
- `data/occupation-descriptions.js` - occupation descriptions
- `data/work-context-data.js` - O*NET work-context data
- `data/industry-data.js` - industry mapping data, embedded age-by-occupation data, and Industrial Fundamental Score inputs

Latest data update:
- Added 2019, 2022, and 2025 median age by occupation from `Age by Occupation Data v3.xlsx`.
- Added median age increase and reference increase-year range.
- Added `industrialFundamentalScore`, calculated as the average of five factor z-scores: historical employment growth, historical wage growth, projected employment growth, 2025 median age, and increase in median age.

To publish on GitHub:
1. Upload this folder to a repository.
2. Enable GitHub Pages for the repo.
3. Open the Pages URL so the data files load correctly with the app file.

For local testing, serve the folder with a simple web server, for example:
- `python -m http.server`
