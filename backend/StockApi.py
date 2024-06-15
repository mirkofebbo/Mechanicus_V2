from dotenv import load_dotenv
import requests
import json
import os

load_dotenv()

STOCK_API_KEY = os.getenv('STOCK_API_KEY')

symbols = [
    'GOOGL', 'AER', 'NVO', 'CERE', 'LBRDK',
    'AMZN', 'CRH', 'ARMK', 'BKNG', 'J',
    'UBER', 'AKTA', 'WRK', 'CBOE', 'EMXC',
    'PCG', 'ACN', 'DASH', 'DHI', 'NKE',
    'TECK', 'RUN', 'AZN', 'LQD', 'IBKR'
]

def fetch_and_save_stock_data(api_key, symbols, output_file):
    print(api_key )
    """
    Fetch daily stock data for given symbols from Alpha Vantage and save to a single JSON file.

    Parameters:
    - api_key (str): The API key for Alpha Vantage.
    - symbols (list): A list of stock symbols to fetch data for.
    - output_file (str): The file path to save the JSON data.

    Returns:
    None
    """
    all_data = {}

    for symbol in symbols:
        url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={api_key}'
        r = requests.get(url)
        data = r.json()
        print(data)
        time_series = data.get("Time Series (Daily)", {})
        for date, values in time_series.items():
            close_price = values.get("4. close")
            volume = values.get("5. volume")
            if date not in all_data:
                all_data[date] = {}
            all_data[date][symbol] = {
                'close_price': close_price,
                'volume': volume
            }

    with open(output_file, 'w') as f:
        json.dump(all_data, f, indent=4)

if __name__ == "__main__":
    # NEED TO CHANGE THIS AS THIS IS NOT THE CORRECT WAY TO DO IT
    output_file = 'frontend/src/data/all_stocks.json' # NOT SAVE ON THE FRONTEND 
    fetch_and_save_stock_data(STOCK_API_KEY, symbols, output_file)