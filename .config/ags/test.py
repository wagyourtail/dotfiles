import gi
gi.require_version('Gtk', '3.0')
from gi.repository import Gtk

icon_theme = Gtk.IconTheme()
print(icon_theme.list_icons())