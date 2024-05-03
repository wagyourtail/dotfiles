import gi, inspect, pprint
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk, Gdk


for i in range(0, Gdk.Display.get_default().get_n_monitors()):
    monitor = Gdk.Display.get_default().get_monitor(i)
    geom = monitor.get_geometry()
    print(geom.x, geom.y, geom.width, geom.height)