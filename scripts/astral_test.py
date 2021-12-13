from pytz import all_timezones
from astral.sun import sun
import datetime
from astral import LocationInfo
# 49.16072096422805, -123.14415705501548


for timezone in all_timezones:
    print(timezone)

city = LocationInfo("Richmond", "Canada", "Canada/Pacific",
                    49.16072096422805, -123.14415705501548)
s = sun(city.observer, date=datetime.date(2021, 12, 13), tzinfo=city.timezone)
print((
    f'日出: {s["sunrise"]}\n'
    f'正午: {s["noon"]}\n'
))

s = sun(city.observer, date=datetime.date(2021, 12, 14), tzinfo=city.timezone)
print((
    f'Sunrise: {s["sunrise"]}\n'
))
