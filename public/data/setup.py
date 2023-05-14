import json
import os
import tqdm
import pandas as pd
import numpy as np

# ===========================================================================================================
# READ REPRESENTED COUNTRIES FROM GEO JSON

with open("./world.geo.json", "r", encoding="utf8") as file:
    data = json.load(file)
    names = [c["properties"]["name"] for c in data["features"]]
    ids = list(range(len(names)))
    ids = [str(e) for e in ids]
    df = pd.DataFrame({"id": ids, "name": names})
    df.to_json("./datasets/Country Ids.json", orient="records", force_ascii=True)

# ===========================================================================================================
# PREPARE FILENAMES AND RESOURCE PATHS

dirs = ["./datasets/ecology/", "./datasets/economy/", "./datasets/population/"]

optionsEcology = [
    "Arable land (percent of total land area)",
    "Emissions per capita (metric tons of carbon dioxide)",
    "Forest cover (percent of total land area)",
    "Important sites for terrestrial biodiversity protected (percent of total sites protected)",
    "Land area (thousand hectares)",
    "Permanent crops (percent of total land area)",
]

optionsEconomy = [
    "Balance of Payments Current account (millions of US dollars)",
    "Balance of Payments Financial account (millions of US dollars)",
    "GDP per capita (US dollars)",
    "GDP real rates of growth (percent)",
    "Grants of patents (number)",
]

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

for dir in dirs:
    if not os.path.exists(dir):
        os.mkdir(dir)

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

# ===========================================================================================================
# MANUEL NAME MAPPING

country_remap = pd.read_json("./Country Remap.json")
countries = pd.read_json("./datasets/Country Ids.json",
                         orient="records", dtype={"id": str, "name": str})

countries = pd.merge(countries, country_remap, "left", left_on="name", right_on="from")
countries["name"] = np.where(countries["to"].notna(), countries["to"], countries["name"])
countries.drop(["from", "to"], axis=1, inplace=True)

# ===========================================================================================================
# WRAPPER FUNCTIONS

def load_dataframe(url: str) -> pd.DataFrame:
    ds = pd.read_csv(url, header=None)
    ds.columns = ds.iloc[1]
    ds = ds[2:]

    ds.drop(["Footnotes", "Source"], axis=1, inplace=True)
    ds.rename({"Region/Country/Area": "id",
               np.nan: "name"}, axis=1, inplace=True)

    return pd.merge(countries, ds, "inner", "name").drop(
        "id_y", axis=1).rename({"id_x": "id"}, axis=1)


def write_dataframe(url: str) -> None:
    ds_processed = load_dataframe(url)

    for name, data in ds_processed.groupby(["Series"]):
        data = data.pivot(index="id", columns="Year", values="Value")
        for c in data.columns:
            data.loc[:, c] = pd.to_numeric(
                data.loc[:, c].str.replace(",", "", regex=True))
        data = data.reset_index()

        data.dropna(axis=1, thresh=len(data) * .7, inplace=True)

        name = name[0].replace(":", "")
        name = name.replace("%", "percent")

        economy = True if name in optionsEconomy else False
        ecology = True if name in optionsEcology else False
        population = True if name in optionsPopulation else False

        if ecology:
            data.to_json("{}{}.json".format(dirs[0], name), orient='records')
        elif economy:
            data.to_json("{}{}.json".format(dirs[1], name), orient='records')
        elif population:
            data.to_json("{}{}.json".format(dirs[2], name), orient='records')

# ===========================================================================================================

for url in tqdm.tqdm(files):
    write_dataframe(url)
print("DONE")