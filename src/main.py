import sys
from src.log_importer import read_log_file

def main(log_file_path):
    try:
        logs = read_log_file(log_file_path)
        for log in logs:
            print(f"{log['timestamp']} - {log['level']} - {log['message']}")
    except FileNotFoundError:
        print(f"Error: The file {log_file_path} was not found.")
    except Exception as e:
        print(f"An error occurred while importing the log file: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python main.py <log_file_path>")
    else:
        main(sys.argv[1])
