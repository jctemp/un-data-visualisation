import pandas as pd
import os

country_ids = pd.read_json("./Country Ids.json")["Id"]

dirs = ["./ecology/", "./economy/", "./population/"]
files = [os.listdir(path) for path in dirs]
for i in range(len(dirs)):
    files[i] = [f"{dirs[i]}{file}" for file in files[i]]
files = [item for list in files for item in list]

for file in files:
    df = pd.read_json(file)
    df = df[df["Id"].isin(country_ids)]
    df = df.dropna(axis=1, thresh=len(df) * .7)
    df.to_json(file)
