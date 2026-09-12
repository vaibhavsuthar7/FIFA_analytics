import pandas as pd
import numpy as np
import json
import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
input_path = os.path.join(base_dir, "raw_data", "players_22.csv")
if not os.path.exists(input_path):
    input_path = os.path.join(base_dir, "players_22.csv")
df = pd.read_csv(input_path)

print("Raw data loaded. Shape:", df.shape)

# Step 3.1 & 3.3: Clean Blanks
df['club_name'] = df['club_name'].fillna('Free Agent')
df['nationality_name'] = df['nationality_name'].fillna('Unknown')

# Step 3.4: Primary Position
df['primary_position'] = df['player_positions'].astype(str).apply(lambda x: x.split(',')[0].strip())

# Step 4.1: Position Group (DAX equivalent)
def get_position_group(pos):
    pos = pos.upper()
    if pos == "GK":
        return "Goalkeeper"
    elif pos in ["CB", "LB", "RB", "LWB", "RWB"]:
        return "Defender"
    elif pos in ["CDM", "CM", "CAM", "LM", "RM"]:
        return "Midfielder"
    else:
        return "Attacker"

df['position_group'] = df['primary_position'].apply(get_position_group)

# Step 4.2: Age Bucket
def get_age_bucket(age):
    if age <= 21:
        return "U21"
    elif age <= 25:
        return "21-25"
    elif age <= 30:
        return "26-30"
    else:
        return "30+"

df['age_bucket'] = df['age'].apply(get_age_bucket)

# Step 4.3: Growth Potential
df['growth_potential'] = df['potential'] - df['overall']

# Step 4.4: Value For Money (Rating per Million Euros)
df['value_million'] = df['value_eur'] / 1000000.0
df['value_for_money'] = np.where(df['value_million'] > 0, df['overall'] / df['value_million'], 0)
df['value_for_money'] = df['value_for_money'].round(2)

# Step 4.5: Hidden Gem Flag
df['hidden_gem_flag'] = np.where(
    (df['growth_potential'] >= 8) & (df['age'] <= 23),
    "Hidden Gem",
    "Regular Target"
)

# Export cleaned CSV
cleaned_dir = os.path.join(base_dir, "cleaned_data")
os.makedirs(cleaned_dir, exist_ok=True)
cleaned_csv_path = os.path.join(cleaned_dir, "cleaned_players.csv")
df.to_csv(cleaned_csv_path, index=False)
print("Cleaned CSV exported to:", cleaned_csv_path)

# Export JSON for Web App
json_path = os.path.join(cleaned_dir, "players_data.json")
records = df.to_dict(orient='records')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2)
print("JSON exported to:", json_path)

# Summary Stats
print("\n--- SUMMARY METRICS ---")
print("Total Players:", len(df))
print("Avg Rating:", round(df['overall'].mean(), 1))
print("Avg Potential:", round(df['potential'].mean(), 1))
print("Hidden Gems Count:", (df['hidden_gem_flag'] == "Hidden Gem").sum())
print("Avg Value (€M):", round(df['value_million'].mean(), 2))


