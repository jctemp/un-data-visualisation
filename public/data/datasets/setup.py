import os
import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import tqdm

if len(sys.argv) != 2:
    raise ValueError("Missing destination.")

dest = sys.argv[1]
print(dest)

files = [
    "https://data.un.org/_Docs/SYB/CSV/SYB65_1_202209_Population,%20Surface%20Area%20and%20Density.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_246_202209_Population%20Growth,%20Fertility%20and%20Mortality%20Indicators.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_230_202209_GDP%20and%20GDP%20Per%20Capita.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_245_202209_Public%20expenditure%20on%20education.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_329_202209_Labour%20Force%20and%20Unemployment.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_263_202209_Production,%20Trade%20and%20Supply%20of%20Energy.csv", # optional
    "https://data.un.org/_Docs/SYB/CSV/SYB65_328_202209_Intentional%20homicides%20and%20other%20crimes.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_145_202209_Land.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_310_202209_Carbon%20Dioxide%20Emission%20Estimates.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_315_202209_Water%20and%20Sanitation%20Services.csv",
    "https://data.un.org/_Docs/SYB/CSV/SYB65_313_202209_Threatened%20Species.csv",
]

# Pre-definitions
def load_dataframe(url: str) -> pd.DataFrame:
    ds = pd.read_csv(url, header=None)
    ds.columns = ds.iloc[1]
    ds = ds[2:]

    ds_processed = ds.drop(["Footnotes", "Source"], axis=1)
    ds_processed.rename({"Region/Country/Area": "Id", np.nan: "Name"}, axis=1, inplace=True)

    return ds_processed

def write_dataframe(url: str) -> None:
    if not os.path.exists(dest):
        os.mkdir(dest)

    ds_processed = load_dataframe(url)

    for name, data in ds_processed.groupby(["Series"]):
        data = data.pivot(index="Id", columns="Year", values="Value")
        for c in data.columns:
            data.loc[:,c] = pd.to_numeric(data.loc[:,c].str.replace(",", "", regex=True))
        data.to_csv(f"{dest}/{name[0]}.csv")



for url in tqdm.tqdm(files): write_dataframe(url)
print("DONE")

# # Create mapping for id to country
# ds = pd.read_csv(f"{files[0]}", header=None)
# ds.columns = ds.iloc[1]
# ds = ds[2:]

# ds_processed = ds.drop(["Footnotes", "Source", "Year", "Series", "Value"], axis=1)
# ds_processed.rename({"Region/Country/Area": "Id", np.nan: "Name"}, axis=1, inplace=True)
# ds_processed.drop_duplicates(inplace=True)
# ds_processed.set_index("Id",inplace=True)
# ds_processed.to_csv(f"{dest}/_Id_Country_Map.csv")