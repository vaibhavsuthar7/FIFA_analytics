# FIFA Player Scouting Dashboard
### End-to-End Power BI Analytics Project

---

## 1. Project Overview

The **FIFA Player Scouting Dashboard** is an interactive Power BI project built to help football scouts, analysts, and fans identify top talent, hidden gems, and value-for-money players using the FIFA player attributes dataset.

The dashboard replicates a real-world **player scouting workflow** used by football clubs — combining performance ratings, growth potential, age, and market value into a single interactive tool for data-driven recruitment decisions.

---

## 2. Objective

- To clean and structure raw FIFA player data for analysis.
- To identify the best-performing players by position and skill attributes.
- To discover young players with high growth potential ("hidden gems").
- To evaluate players offering the best value relative to their market price.
- To build an interactive, multi-page Power BI dashboard for scouting decisions.

---

## 3. Tools & Technologies

| Tool | Purpose |
|---|---|
| **Power BI Desktop** | Data modeling, DAX measures, dashboard visualization |
| **Power Query (M)** | Data cleaning and transformation |
| **DAX** | Custom calculated measures and columns |
| **Kaggle Dataset (CSV)** | Source data — FIFA complete player attributes dataset |

---

## 4. Dataset

**Source:** Kaggle — "FIFA Complete Player Dataset" (e.g., FIFA 22/23 dataset by stefanoleone992)

**Key columns used:**

| Column | Description |
|---|---|
| `short_name` | Player name |
| `age` | Player's age |
| `nationality_name` | Country |
| `club_name` | Current club |
| `overall` | Current overall rating |
| `potential` | Projected peak rating |
| `value_eur` | Market value in Euros |
| `wage_eur` | Weekly wage in Euros |
| `player_positions` | Playing position(s) |
| `pace`, `shooting`, `passing`, `dribbling`, `defending`, `physic` | Core skill attributes |
| `preferred_foot` | Left/Right |
| `contract_valid_until` | Contract expiry year |

---

## 5. Data Cleaning (Power Query)

Steps performed in Power Query Editor before loading data into the model:

1. **Removed unnecessary columns** — player photo URLs, club logo URLs, and other non-analytical fields.
2. **Fixed data types** — converted `age`, `overall`, `potential`, `value_eur`, `wage_eur` to numeric/whole number types.
3. **Handled missing values** — replaced blanks in `club_name` with "Free Agent"; removed rows with missing `overall` rating.
4. **Split `player_positions`** — players with multiple positions (e.g., "ST, CF") were split into a primary position column for cleaner grouping.
5. **Standardized position codes** — mapped raw codes (ST, CM, CB, GK, etc.) into a readable `Position Group` column (Attacker / Midfielder / Defender / Goalkeeper).
6. **Removed duplicates** — checked and removed duplicate player entries based on player ID.

---

## 6. Data Modeling & DAX Measures

The following calculated measures/columns were created to power the analysis:

```dax
Value for Money = DIVIDE([Overall Rating], [Value(EUR)], 0)

Growth Potential = [Potential] - [Overall]

Age Bucket =
SWITCH(
    TRUE(),
    Players[age] <= 21, "U21",
    Players[age] <= 25, "21-25",
    Players[age] <= 30, "26-30",
    "30+"
)

Position Group =
SWITCH(
    TRUE(),
    Players[player_positions] IN {"GK"}, "Goalkeeper",
    Players[player_positions] IN {"CB","LB","RB","LWB","RWB"}, "Defender",
    Players[player_positions] IN {"CDM","CM","CAM","LM","RM"}, "Midfielder",
    "Attacker"
)

Hidden Gem Flag =
IF([Growth Potential] >= 8 && Players[age] <= 23, "Hidden Gem", "Regular")

Avg Overall Rating = AVERAGE(Players[overall])

Total Players = COUNTROWS(Players)
```

**Why these measures matter:**
- *Value for Money* surfaces players who deliver high performance relative to cost — key for budget-conscious scouting.
- *Growth Potential* and *Hidden Gem Flag* highlight young players worth investing in before their value rises.
- *Position Group* and *Age Bucket* enable clean, consistent slicing across the dashboard.

---

## 7. Dashboard Structure (4 Pages)

### Page 1 — Overview
- KPI cards: Total Players, Average Rating, Average Age, Total Clubs/Nationalities represented
- Bar chart: Top 10 nationalities by player count
- Bar chart: Top 10 clubs by average squad rating
- Donut chart: Player distribution by Position Group

### Page 2 — Best Players
- Sortable table: Top players by Overall Rating (with slicers for Position, Club, Nationality)
- Radar/spider chart: Skill attribute comparison (Pace, Shooting, Passing, Dribbling, Defending, Physical) for a selected player
- Top scorers/best defenders leaderboard by position group

### Page 3 — Young Talent Scouting
- Scatter plot: Age (X-axis) vs Potential (Y-axis), bubble size = Overall Rating
- Filter: Growth Potential ≥ 8 to isolate "Hidden Gems"
- Table: Top 20 young players (U23) ranked by Growth Potential

### Page 4 — Value for Money
- Scatter plot: Market Value (X-axis) vs Overall Rating (Y-axis)
- Highlighted quadrant: High Rating + Low Value = best value signings
- Table: Top 20 undervalued players ranked by Value for Money measure

**Cross-page interactivity:** All slicers (Position, Age Bucket, Nationality, Club, League, Preferred Foot) sync across pages using Power BI's built-in cross-filtering.

---

## 8. Key Insights (Template — replace with your actual findings once dataset is loaded)

- Identified **X players under age 21** with a Growth Potential score of 8+, representing strong long-term scouting targets.
- **[Nationality/League]** has the highest concentration of high-potential young talent in the dataset.
- The best "value for money" signings were concentrated in the **[Position Group]** category, offering high ratings at relatively low market value.
- Average squad rating varies significantly by league, with **[League Name]** leading among top-5 European leagues.

> Replace the bracketed placeholders above with real numbers once you run the dashboard on the actual Kaggle dataset — this section becomes your strongest resume talking point.

---

## 9. How to Use This Project

1. Download the dataset from Kaggle and place the CSV in the project folder.
2. Open `FIFA_Scouting_Dashboard.pbix` in Power BI Desktop.
3. Refresh the data source to point to your local CSV path (Home → Transform Data → Data Source Settings).
4. Use the slicers on each page to filter by position, age, club, or nationality.
5. Explore the four dashboard pages to identify top players, young talent, and value signings.

---

## 10. Project Files

| File | Description |
|---|---|
| `FIFA_Scouting_Dashboard.pbix` | Final Power BI dashboard file |
| `players_cleaned.csv` | Cleaned dataset used in the model |
| `dashboard_screenshots/` | PNG exports of each dashboard page |
| `README.md` | Project summary for GitHub |
| `FIFA_Player_Scouting_Dashboard_Documentation.md` | This full documentation file |

---

## 11. Skills Demonstrated

- Data cleaning and transformation using Power Query (M language)
- Data modeling and relationship building in Power BI
- Advanced DAX measures and calculated columns
- Multi-page interactive dashboard design
- Business-oriented scouting/recruitment analytics
- Insight generation and storytelling with data

---

## 12. Author

**[Your Name]**
Data Analyst | Power BI · SQL · Excel
📧 [your-email@example.com]
🔗 [LinkedIn Profile] | [GitHub Profile]

---

*This project is part of a personal data analytics portfolio.*
