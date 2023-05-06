import './style.css'
import viteLogo from '/vite.svg'
import "./map/map"

const options =
  ["All staff compensation as % of total expenditure in public institutions (%)",
    "Arable land (% of total land area)",
    "Arable land (thousand hectares)",
    "Assault rate per 100,000 population",
    "Capital expenditure as % of total expenditure in public institutions (%)",
    "Changes in stocks (petajoules)",
    "Current expenditure other than staff compensation as % of total expenditure in public institutions (%)",
    "Emissions (thousand metric tons of carbon dioxide)",
    "Emissions per capita (metric tons of carbon dioxide)",
    "Forest cover (% of total land area)",
    "Forest cover (thousand hectares)",
    "GDP in constant 2010 prices (millions of US dollars)",
    "GDP in current prices (millions of US dollars)",
    "GDP per capita (US dollars)",
    "GDP real rates of growth (percent)",
    "Id_Country_Map",
    "Important sites for terrestrial biodiversity protected (% of total sites protected)",
    "Infant mortality for both sexes (per 1,000 live births)",
    "Intentional homicide rates per 100,000",
    "Kidnapping at the national level, rate per 100,000",
    "Labour force participation - Female",
    "Labour force participation - Male",
    "Labour force participation - Total",
    "Land area (thousand hectares)",
    "Life expectancy at birth for both sexes (years)",
    "Life expectancy at birth for females (years)",
    "Life expectancy at birth for males (years)",
    "Maternal mortality ratio (deaths per 100,000 population)",
    "Net imports [Imports - Exports - Bunkers] (petajoules)",
    "Percentage of male and female intentional homicide victims, Female",
    "Percentage of male and female intentional homicide victims, Male",
    "Permanent crops (% of total land area)",
    "Permanent crops (thousand hectares)",
    "Population aged 0 to 14 years old (percentage)",
    "Population aged 60+ years old (percentage)",
    "Population annual rate of increase (percent)",
    "Population density",
    "Population mid-year estimates (millions)",
    "Population mid-year estimates for females (millions)",
    "Population mid-year estimates for males (millions)",
    "Primary energy production (petajoules)",
    "Public expenditure on education (% of GDP)",
    "Robbery at the national level, rate per 100,000 population",
    "Safely managed drinking water sources, rural (Proportion of population with access)",
    "Safely managed drinking water sources, total (Proportion of population with access)",
    "Safely managed drinking water sources, urban (Proportion of population with access)",
    "Safely managed sanitation facilities, rural (Proportion of population with access)",
    "Safely managed sanitation facilities, total (Proportion of population with access)",
    "Safely managed sanitation facilities, urban (Proportion of population with access)",
    "Sex ratio (males per 100 females)",
    "Supply per capita (gigajoules)",
    "Surface area (thousand km2)",
    "Theft at the national level, rate per 100,000 population",
    "Total Sexual Violence at the national level, rate per 100,000",
    "Total fertility rate (children per women)",
    "Total supply (petajoules)",
    "Unemployment rate - Female",
    "Unemployment rate - Male",
    "Unemployment rate - Total",]

const dropdown = document.getElementById("dataset-select")

options.forEach(elem => {
  const opt = document.createElement("option");
  opt.value = elem;
  opt.innerText = elem;
  dropdown?.append(opt);
})
