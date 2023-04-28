import ephem
from datetime import datetime
import time

# https://rhodesmill.org/pyephem/quick.html


def datetime_from_utc_to_local(utc_datetime):
    now_timestamp = time.time()
    offset = datetime.fromtimestamp(now_timestamp) - datetime.utcfromtimestamp(now_timestamp)
    return utc_datetime + offset

# Set the observer's location
observer = ephem.Observer()
observer.lat = '49.16057281165747' # latitude of Richmond 49.16057281165747, -123.14370053902432
observer.lon = '-123.14370053902432' # longitude of Richmond, BC

# Set the date
observer.date = '2023/4/28'

# Calculate sunrise and sunset times
sunrise = observer.previous_rising(ephem.Sun())
sunset = observer.next_setting(ephem.Sun())

# Convert the times to local time zone and print them
print('Sunrise:\t', ephem.localtime(sunrise))
# print('Sunset:', ephem.localtime(sunset))

sun = ephem.Sun()
noon = observer.previous_transit(sun, start=observer.date)
print("Solar Noon:\t", ephem.localtime(noon))
# print("Solar Noon(local):", datetime_from_utc_to_local(noon.timestamp()))

