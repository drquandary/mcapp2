import unittest
from src.log_importer import read_log_file

class TestLogImporter(unittest.TestCase):

    def test_valid_log_file(self):
        logs = read_log_file('tests/valid_log.csv')
        self.assertEqual(len(logs), 3)
        self.assertEqual(logs[0]['timestamp'], '2021-01-01 00:00:00')
        self.assertEqual(logs[0]['level'], 'INFO')
        self.assertEqual(logs[0]['message'], 'This is an info message.')

    def test_missing_field_log_file(self):
        logs = read_log_file('tests/missing_field_log.csv')
        self.assertEqual(len(logs), 2)
        self.assertEqual(logs[0]['timestamp'], '2021-01-01 00:00:00')
        self.assertEqual(logs[0]['level'], 'INFO')
        self.assertEqual(logs[0]['message'], 'This is an info message.')

    def test_invalid_format_log_file(self):
        logs = read_log_file('tests/invalid_format_log.csv')
        self.assertEqual(len(logs), 2)
        self.assertEqual(logs[0]['timestamp'], '2021-01-01 00:00:00')
        self.assertEqual(logs[0]['level'], 'INFO')
        self.assertEqual(logs[0]['message'], 'This is an info message.')

if __name__ == '__main__':
    unittest.main()
