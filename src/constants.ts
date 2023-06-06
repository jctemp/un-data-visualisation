export const TARGET_PROPERTY = "value";

export class DatasetOptions {
    static readonly ecology = [
        "Arable land (percent of total land area)",
        "Emissions per capita (metric tons of carbon dioxide)",
        "Forest cover (percent of total land area)",
        "Important sites for terrestrial biodiversity protected (percent of total sites protected)",
        "Permanent crops (percent of total land area)",
    ];

    static readonly economy = [
        "Balance of Payments Current account (millions of US dollars)",
        "Balance of Payments Financial account (millions of US dollars)",
        "GDP per capita (US dollars)",
        "GDP real rates of growth (percent)",
        "Grants of patents (number)",
    ];

    static readonly population = [
        "Infant mortality for both sexes (per 1,000 live births)",
        "Life expectancy at birth for both sexes (years)",
        "Percentage of individuals using the internet",
        "Population aged 0 to 14 years old (percentage)",
        "Population aged 60+ years old (percentage)",
        "Population annual rate of increase (percent)",
        "Population density",
        "Population mid-year estimates (millions)",
        "Intentional homicide rates per 100,000",
        "Robbery at the national level, rate per 100,000 population",
        "Theft at the national level, rate per 100,000 population"
    ];

    static readonly paths = [
        "/data/datasets/ecology",
        "/data/datasets/economy",
        "/data/datasets/population"
    ];

    static readonly pathMapping = new Map<string, number>()
}

DatasetOptions.ecology.forEach(value => DatasetOptions.pathMapping.set(value, 0));
DatasetOptions.economy.forEach(value => DatasetOptions.pathMapping.set(value, 1));
DatasetOptions.population.forEach(value => DatasetOptions.pathMapping.set(value, 2));

export class ColourSchemes {
    static readonly mono = ["#FFFFFF", "#FF8F02"];
    static readonly duo = ["#104DFF", "#FF8F02"];
    static readonly thresholdMono = ["#FFFFFF", "#FFECC2", "#FFD987", "#FFC13B", "#FAAC00", "#FF8F02"];
    static readonly thresholdDuo = ["#104DFF", "#5F96FF", "#C0D6FF", "#FFECC2", "#FFC13B", "#FF8F02"];
    static readonly regions: { [key: string]: string } = {
        'Africa': "#FF3900",        // red
        'Asia': "#1BDE7E",          // green
        'Europe': "#367DFF",        // blue
        'North America': "#FBF52A", // yellow
        'South America': "#DE951B", // orange
        'Oceania': "#D701FF"        // purple
    }
}

export class Descriptions {
    // important descriptions
    static readonly desc_permanent_crops = "Crops which continue to be harvested for five or more years after planting and which do not need replanting after each harvest. Examples include cocoa, coffee, and rubber.";
    static readonly desc_balance_of_payments_current_account = "The current account is the sum of the balance of trade (exports minus imports of goods and services), net factor income (such as interest and dividends) and net transfer payments (such as foreign aid).";
    static readonly desc_balance_of_payments_financial_account = "The financial account is the sum of direct investment, portfolio investment, and other investment.";
    static readonly desc_population_density = "Population density is midyear population divided by land area in square kilometers. Population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.";

    // secondary descriptions
    static readonly desc_arable_land = "Arable land includes land defined by the FAO as land under temporary crops (double-cropped areas are counted once), temporary meadows for mowing or for pasture, land under market or kitchen gardens, and land temporarily fallow. Land abandoned as a result of shifting cultivation is excluded.";
    static readonly desc_emissions_per_capita = "Carbon dioxide emissions are those stemming from the burning of fossil fuels and the manufacture of cement. They include carbon dioxide produced during consumption of solid, liquid, and gas fuels and gas flaring.";
    static readonly desc_forest_cover = "Forest area is land under natural or planted stands of trees of at least 5 meters in situ, whether productive or not, and excludes tree stands in agricultural production systems (for example, in fruit plantations and agroforestry systems) and trees in urban parks and gardens.";
    static readonly desc_important_sites_for_terrestrial_biodiversity_protected = "Important sites for terrestrial biodiversity protected are those areas of particular importance for biodiversity conservation, including areas contributing to the protection of species, habitats, and ecosystem services of outstanding universal value.";
    static readonly desc_gdp_per_capita = "GDP per capita is gross domestic product divided by midyear population. GDP is the sum of gross value added by all resident producers in the economy plus any product taxes and minus any subsidies not included in the value of the products.";
    static readonly desc_gdp_real_rates_of_growth = "Annual percentage growth rate of GDP at market prices based on constant local currency. Aggregates are based on constant 2010 U.S. dollars. GDP is the sum of gross value added by all resident producers in the economy plus any product taxes and minus any subsidies not included in the value of the products.";
    static readonly desc_grants_of_patents = "Patent applications are worldwide patent applications filed through the Patent Cooperation Treaty procedure or with a national patent office for exclusive rights for an invention--a product or process that provides a new way of doing something or offers a new technical solution to a problem.";
    static readonly desc_infant_mortality = "Infant mortality rate is the number of infants dying before reaching one year of age, per 1,000 live births in a given year.";
    static readonly desc_life_expectancy = "Life expectancy at birth indicates the number of years a newborn infant would live if prevailing patterns of mortality at the time of its birth were to stay the same throughout its life.";
    static readonly desc_percentage_of_individuals_using_the_internet = "Percentage of individuals using the Internet is the estimated percentage of the population that use the Internet. Internet users are individuals who have used the Internet (from any location) in the last 3 months.";
    static readonly desc_population_aged_0_to_14_years_old = "Population aged 0 to 14 years old is the percentage of total population aged 0 to 14 years old.";
    static readonly desc_population_aged_60_years_old = "Population aged 60+ years old is the percentage of total population aged 60 years old and above.";
    static readonly desc_population_annual_rate_of_increase = "Population annual rate of increase is the exponential rate of growth of midyear population, excluding the effect of migration.";
    static readonly desc_population_mid_year_estimates = "Population mid-year estimates is the number of inhabitants of a country or region as of July 1 of the year indicated. Population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.";
    static readonly desc_intentional_homicides = "Intentional homicides are estimates of unlawful homicides purposely inflicted as a result of domestic disputes, interpersonal violence, violent conflicts over land resources, intergang violence over turf or control, and predatory violence and killing by armed groups.";
    static readonly desc_robbery_at_the_national_level = "Robbery at the national level is the number of robberies recorded by police in that country per 100,000 population.";
    static readonly desc_theft_at_the_national_level = "Theft at the national level is the number of thefts recorded by police in that country per 100,000 population.";

    static readonly mapping: { [key: string]: string } = {
        "Arable land (percent of total land area)": Descriptions.desc_arable_land,
        "Emissions per capita (metric tons of carbon dioxide)": Descriptions.desc_emissions_per_capita,
        "Forest cover (percent of total land area)": Descriptions.desc_forest_cover,
        "Important sites for terrestrial biodiversity protected (percent of total sites protected)": Descriptions.desc_important_sites_for_terrestrial_biodiversity_protected,
        "Permanent crops (percent of total land area)": Descriptions.desc_permanent_crops,
        "Balance of Payments Current account (millions of US dollars)": Descriptions.desc_balance_of_payments_current_account,
        "Balance of Payments Financial account (millions of US dollars)": Descriptions.desc_balance_of_payments_financial_account,
        "GDP per capita (US dollars)": Descriptions.desc_gdp_per_capita,
        "GDP real rates of growth (percent)": Descriptions.desc_gdp_real_rates_of_growth,
        "Grants of patents (number)": Descriptions.desc_grants_of_patents,
        "Infant mortality for both sexes (per 1,000 live births)": Descriptions.desc_infant_mortality,
        "Life expectancy at birth for both sexes (years)": Descriptions.desc_life_expectancy,
        "Percentage of individuals using the internet": Descriptions.desc_percentage_of_individuals_using_the_internet,
        "Population aged 0 to 14 years old (percentage)": Descriptions.desc_population_aged_0_to_14_years_old,
        "Population aged 60+ years old (percentage)": Descriptions.desc_population_aged_60_years_old,
        "Population annual rate of increase (percent)": Descriptions.desc_population_annual_rate_of_increase,
        "Population density": Descriptions.desc_population_density,
        "Population mid-year estimates (millions)": Descriptions.desc_population_mid_year_estimates,
        "Intentional homicide rates per 100,000": Descriptions.desc_intentional_homicides,
        "Robbery at the national level, rate per 100,000 population": Descriptions.desc_robbery_at_the_national_level,
        "Theft at the national level, rate per 100,000 population": Descriptions.desc_theft_at_the_national_level,
    }
}

export class Units {
    static readonly mapping: { [key: string]: string } = {
        "Arable land (percent of total land area)": "%",
        "Emissions per capita (metric tons of carbon dioxide)": " metric tons",
        "Forest cover (percent of total land area)": "%",
        "Important sites for terrestrial biodiversity protected (percent of total sites protected)": "%",
        "Permanent crops (percent of total land area)": "%",
        "Balance of Payments Current account (millions of US dollars)": "M USD",
        "Balance of Payments Financial account (millions of US dollars)": "M USD",
        "GDP per capita (US dollars)": " USD",
        "GDP real rates of growth (percent)": "%",
        "Grants of patents (number)": "",
        "Infant mortality for both sexes (per 1,000 live births)": " children per 1,000 births",
        "Life expectancy at birth for both sexes (years)": " years",
        "Percentage of individuals using the internet": "%",
        "Population aged 0 to 14 years old (percentage)": "%",
        "Population aged 60+ years old (percentage)": "%",
        "Population annual rate of increase (percent)": "%",
        "Population density": " people per square kilometer",
        "Population mid-year estimates (millions)": "M",
        "Intentional homicide rates per 100,000": " per 100,000",
        "Robbery at the national level, rate per 100,000 population": " per 100,000",
        "Theft at the national level, rate per 100,000 population": " per 100,000",
    }
}
