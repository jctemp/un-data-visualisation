# [UN Data Visualisation Project]

![](public/logo.png)
<p>
    Our mission is to provide a unique platform for visualising and exploring the extensive datasets
    available on the <a href="https://data.un.org/" class="underline">United Nations Data website</a>. At the UN Data Visualisation
    Project, data is a powerful tool that allows us to understand the world through statistics. By
    transforming complex datasets into interactive and engaging visualisations, we aim to make
    information more accessible, meaningful, and impactful.
</p>

<p>
    Data is at the heart of decision-making processes, policy development, and global initiatives. The
    United Nations collects and curates vast data across various thematic areas, including population,
    economics, education, health, environment, and much more. The UN Data website is a central
    repository of
    reliable and authoritative statistical information from numerous UN agencies and international
    organisations.
</p>

<p>
    We leverage modern technologies like d3.js and chart.js to create performant visualisations. The
    website
    is a proof of concept that one can extend to visualise all thematic areas mentioned previously and
    uncover meaningful patterns and correlations hidden in the raw data.
</p>

-- Visualisation Team

## Use the project locally

```bash
# Clone the repository
git clone https://github.com/jctemp/un-data-visualisation.git

# Navigate to the project directory
cd un-data-visualisation

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Note: The project is built using [Vite](https://vitejs.dev/), a fast build tool for modern web apps. Vite requires Node.js version >=14.18.

## Project structure
    
```bash
project
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── pages
│   ├── about.html
│   └── visualisation.html
├── postcss.config.js
├── public
│   ├── data
│   │   ├── Country Remap.json
│   │   ├── datasets
│   │   │   └── ...
│   │   ├── setup.py
│   │   └── world.geo.json
│   ├── duo_color_palett.png
│   ├── img
│   │   └── ...
│   └── logo.png
├── requirements.txt
├── src
│   ├── components
│   │   ├── chart.css
│   │   ├── chart.ts
│   │   ├── options.css
│   │   ├── options.ts
│   │   ├── searchbar.css
│   │   ├── searchbar.ts
│   │   ├── selection.css
│   │   ├── selection.ts
│   │   ├── toggle.css
│   │   ├── toggle.ts
│   │   ├── worldMap.css
│   │   └── worldMap.ts
│   ├── constants.ts
│   ├── index.ts
│   ├── style.css
│   ├── utils
│   │   ├── container.ts
│   │   ├── dataset.ts
│   │   └── scaling.ts
│   ├── visualisation.ts
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.json
└── vite.config.js
```


## Sources

- [UN Data](https://data.un.org/)
- [D3.js](https://d3js.org/)
- [Chart.js](https://www.chartjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Fonts](https://fonts.google.com/)
- [Searchbar](https://codepen.io/mey_mnry/pen/QWqPvox)
- [Choropleth map](https://observablehq.com/@d3/choropleth)
