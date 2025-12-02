import pandas as pd

# Path to the CSV file
file_path = "/home/lazafi/Downloads/AggregatedData_AustralianSpeciesOccurrences_1.1.2023-06-13.csv"

# Load the CSV file into a pandas DataFrame
try:
    df = pd.read_csv(file_path)

    unique_species = df["speciesName"].dropna().unique()
    print("Unique species names:")
    for species in unique_species:
        print(species)
#   print("File loaded successfully!")
 #   print(df.head())  # Display the first 5 rows
except FileNotFoundError:
    print(f"Error: The file '{file_path}' was not found.")
except pd.errors.EmptyDataError:
    print("Error: The file is empty.")
except pd.errors.ParserError:
    print("Error: There was a problem parsing the CSV file.")