# UN Data Visualisation Project

**Visit the page https://jctemp.github.io/un-data-visualisation/.**

![](public/logo.png)
<p>
    Our mission is to provide a unique platform for visualising and exploring the extensive datasets
    available on the United Nations Data website</a>.
    At the UN Data Visualisation Project, data is a
    powerful tool that allows us to understand the world through statistics. By transforming complex
    datasets into interactive and engaging visualisations, we aim to make information more accessible,
    meaningful, and impactful.

    Our objective is to create a unique platform for visualising and exploring the vast datasets
    available on the <a href="https://data.un.org/" class="underline">United Nations Data website</a>.
    Data is a potent instrument that helps us comprehend
    the world through statistics at the UN Data Visualisation Project. We seek to increase the
    accessibility, significance, and impact of knowledge by converting complex datasets into interactive
    and compelling visualisations.
</p>

<p>
    Data is the driving force behind global efforts, policy creation, and decision-making processes. The
    United Nations gathers and organizes a great amount of data on a variety of subjects, including
    population, economy, education, health, environment, and many other topics. A central hub for
    trustworthy and credible statistics data from several UN agencies and international organizations is
    the UN Data website.
</p>

<p>
    We use cutting-edge tools like d3.js and chart.js to build effective visualizations. The website
    serves as a proof-of-concept that can be expanded to visualize all the previously listed theme areas
    and reveal significant patterns and connections that are buried in the raw data.
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
