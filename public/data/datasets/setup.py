import os
import pandas as pd
import numpy as np
import tqdm

dirs = ["./ecology/", "./economy/", "./population/"]

optionsEcology = [
    "Arable land (percent of total land area)",
    "Emissions per capita (metric tons of carbon dioxide)",
    "Forest cover (percent of total land area)",
    "Important sites for terrestrial biodiversity protected (percent of total sites protected)",
    "Land area (thousand hectares)",
    "Permanent crops (percent of total land area)",
]

if not os.path.exists("ecology"):
    os.mkdir("ecology")

optionsEconomy = [
    "Balance of Payments Current account (millions of US dollars)",
    "Balance of Payments Financial account (millions of US dollars)",
    "GDP per capita (US dollars)",
    "GDP real rates of growth (percent)",
    "Grants of patents (number)",
]

if not os.path.exists("economy"):
    os.mkdir("economy")

optionsPopulation = [
    "Infant mortality for both sexes (per 1,000 live births)",
    "Life expectancy at birth for both sexes (years)",
    "Percentage of individuals using the internet",
    "Population aged 0 to 14 years old (percentage)",
    "Population aged 60+ years old (percentage)",
    "Population annual rate of increase (percent)",
    "Population density",
    "Population mid-year estimates (millions)",
]

optionsFilter = [
    "Arable land (thousand hectares)",
    "Balance of Payments Capital account (millions of US dollars)",
    "Emissions (thousand metric tons of carbon dioxide)",
    "Forest cover (thousand hectares)",
    "GDP in constant 2010 prices (millions of US dollars)",
    "GDP in current prices (millions of US dollars)",
    "Life expectancy at birth for females (years)",
    "Life expectancy at birth for males (years)",
    "Maternal mortality ratio (deaths per 100,000 population)",
    "Patents in force (number)",
    "Permanent crops (thousand hectares)",
    "Population mid-year estimates for females (millions)",
    "Population mid-year estimates for males (millions)",
    "Resident patent filings (per million population)",
    "Sex ratio (males per 100 females)",
    "Surface area (thousand km2)",
    "Total fertility rate (children per women)",
]

if not os.path.exists("population"):
    os.mkdir("population")

files = [
    "https://data.un.org/_Docs/SYB/CSV/SYB65_246_202209_Population%20Growth,%20Fertility%20and%20Mortality%20Indicators.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_1_202209_Population,%20Surface%20Area%20and%20Density.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_310_202209_Carbon%20Dioxide%20Emission%20Estimates.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_145_202209_Land.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_230_202209_GDP%20and%20GDP%20Per%20Capita.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_264_202209_Patents.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_314_202209_Internet%20Usage.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_125_202209_Balance%20of%20Payments.csv",
]


# Pre-definitions
def load_dataframe(url: str) -> pd.DataFrame:
    ds = pd.read_csv(url, header=None)
    ds.columns = ds.iloc[1]
    ds = ds[2:]

    ds_processed = ds.drop(["Footnotes", "Source"], axis=1)
    ds_processed.rename({"Region/Country/Area": "Id",
                        np.nan: "Name"}, axis=1, inplace=True)

    return ds_processed


def write_dataframe(url: str) -> None:
    ds_processed = load_dataframe(url)

    for name, data in ds_processed.groupby(["Series"]):
        data = data.pivot(index="Id", columns="Year", values="Value")
        for c in data.columns:
            data.loc[:, c] = pd.to_numeric(
                data.loc[:, c].str.replace(",", "", regex=True))
        data = data.reset_index()

        name = name[0].replace(":", "")
        name = name.replace("%", "percent")

        economy = True if name in optionsEconomy else False
        ecology = True if name in optionsEcology else False
        population = True if name in optionsPopulation  else False

        if economy:
            data.to_json("{}{}.json".format(dirs[1], name))
        elif ecology:
            data.to_json("{}{}.json".format(dirs[0], name))
        elif population:
            data.to_json("{}{}.json".format(dirs[2], name))


for url in tqdm.tqdm(files):
    write_dataframe(url)
print("DONE")

# # # Create mapping for id to country
# ds = pd.read_csv(f"{files[0]}", header=None)
# ds.columns = ds.iloc[1]
# ds = ds[2:]

# ds_processed = ds.drop(["Footnotes", "Source", "Year", "Series", "Value"], axis=1)
# ds_processed.rename({"Region/Country/Area": "Id", np.nan: "Name"}, axis=1, inplace=True)
# ds_processed.drop_duplicates(inplace=True)
# ds_processed.set_index("Id",inplace=True)
# ds_processed.to_csv(f"{dest}/_Id_Country_Map.csv")
