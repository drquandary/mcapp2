import csv

def read_log_file(file_path):
    logs = []
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                log_entry = {
                    'timestamp': row['timestamp'],
                    'level': row['level'],
                    'message': row['message']
                }
                logs.append(log_entry)
            except KeyError as e:
                print(f"Missing field in log file: {e}")
            except ValueError as e:
                print(f"Invalid format in log file: {e}")
    return logs
