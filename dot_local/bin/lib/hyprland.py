import subprocess, json, re
from enum import Enum
from typing import TypeAlias, Union, Literal, TypedDict, Annotated

class WindowClass:
    def __init__(self, value: re.Pattern) -> None:
        self.value = value

    def __str__(self) -> str:
        return self.value.pattern

class WindowTitle:
    def __init__(self, value: re.Pattern) -> None:
        self.value = value

    def __str__(self) -> str:
        return f"title:{self.value.pattern}"
    
class WindowPID:
    def __init__(self, value: int) -> None:
        self.value = value

    def __str__(self) -> str:
        return f"pid:{self.value}"
    
class WindowAddress:
    def __init__(self, value: int) -> None:
        self.value = value

    def __str__(self) -> str:
        return f"address:{hex(self.value)}"

WindowIdentifier: TypeAlias = Union[WindowClass, WindowTitle, WindowPID, WindowAddress, Literal["floating"], Literal["tiled"]]

class RelativeId:
    def __init__(self, value: int) -> None:
        self.value = value

    def __str__(self) -> str:
        if self.value < 0:
            return str(self.value)
        return f"+{self.value}"

class MonitorWorkspaceId(RelativeId):
    def __init__(self, value: int, empty: bool = False, absolute: bool = False) -> None:
        super().__init__(value)
        self.empty = empty
        self.absolute = absolute
        if self.absolute:
            if self.value < 1:
                raise ValueError("Monitor workspace id must be greater than 0")

    def __str__(self) -> str:
        if self.absolute:
            if self.empty:
                return f"r~{self.value}"
            return f"m~{self.value}"
        if self.empty:
            return f"r{super().__str__()}"
        return f"m{super().__str__()}"

class OpenRelativeWorkspaceId(RelativeId):
    def __init__(self, value: int, absolute: bool = False) -> None:
        super().__init__(value)
        self.absolute = absolute
        if self.absolute:
            if self.value < 1:
                raise ValueError("Open relative workspace id must be greater than 0")

    def __str__(self) -> str:
        if self.absolute:
            return f"e~{self.value}"
        return f"e{super().__str__()}"

class NamedWorkspace:
    def __init__(self, value: str) -> None:
        self.value = value

    def __str__(self) -> str:
        return f"name:{self.value}"

class SpecialWorkspace:
    def __init__(self, value: str) -> None:
        self.value = value

    def __str__(self) -> str:
        return f"special:{self.value}"

class EmptyWorkspace:
    def __init__(self, next: bool = False, mon: bool = False) -> None:
        self.next = next
        self.mon = mon

    def __str__(self) -> str:
        e = "empty"
        if self.next:
            e += "n"
        if self.mon:
            e += "m"
        return e

WorkspaceIdentifier: TypeAlias = Union[int, RelativeId, MonitorWorkspaceId, OpenRelativeWorkspaceId, NamedWorkspace, SpecialWorkspace, EmptyWorkspace, Literal["previous"]]

class Direction(Enum):
    LEFT = "l"
    RIGHT = "r"
    UP = "u"
    DOWN = "d"

    def __str__(self) -> str:
        return self.value

class MonitorName:
    def __init__(self, value: str) -> None:
        self.value = value

    def __str__(self) -> str:
        return self.value

MonitorIdentifier: TypeAlias = Union[Direction, int, MonitorName, Literal["current"], RelativeId]

class ResizeParams:
    def __init__(self, width: int, height: int, exact: bool = False, percentWidth: bool = False, percentHeight: bool = False):
        self.width = width
        self.height = height
        self.exact = exact
        self.percentWidth = percentWidth
        self.percentHeight = percentHeight
    
    def __str__(self) -> str:
        value = ""
        if self.exact:
            value += "exact "
        value += str(self.width)
        if self.percentWidth:
            value += "%"
        value += " "
        value += str(self.height)
        if self.percentHeight:
            value += "%"
        return value

class FloatValue:
    def __init__(self, value: float, exact: bool = False):
        self.value = value
    
    def __str__(self) -> str:
        value = ""
        if self.exact:
            value += "exact "
        value += str(self.value)
        return value

class ZHeight(Enum):
    TOP = "top"
    BOTTOM = "bottom"

    def __str__(self) -> str:
        return self.value

class OnOffToggle(Enum):
    ON = "on"
    OFF = "off"
    TOGGLE = "toggle"

    def __str__(self) -> str:
        return self.value

class Corner(Enum):
    BOTTOM_LEFT = 0
    BOTTOM_RIGHT = 1
    TOP_RIGHT = 2
    TOP_LEFT = 3

    def __str__(self) -> str:
        return str(self.value)

class Dispatcher:
    def exec(command: list[str]):
        subprocess.run(["hyprctl", "dispatch", "exec", *command])

    def execr(command: list[str]):
        subprocess.run(["hyprctl", "dispatch", "execr", *command])

    def kill_active():
        subprocess.run(["hyprctl", "dispatch", "killactive"])

    def close_window(window: WindowIdentifier):
        subprocess.run(["hyprctl", "dispatch", "closewindow", str(window)])

    def workspace(workspace: WorkspaceIdentifier):
        subprocess.run(["hyprctl", "dispatch", "workspace", str(workspace)])

    def move_to_workspace(workspace: WorkspaceIdentifier, window: WindowIdentifier = None, silent: bool = False):
        subprocess.run(["hyprctl", "dispatch", "movetoworkspacesilent" if silent else "movetoworkspace", str(workspace)] + ([str(window)] if window else []))
    
    def toggle_floating(window: Union[WindowIdentifier, Literal["active"]] = "active"):
        subprocess.run(["hyprctl", "dispatch", "togglefloating"] + ([str(window)] if window != None else []))

    def set_floating(window: WindowIdentifier, value: bool = True):
        subprocess.run(["hyprctl", "dispatch", "setfloating" if value else "settiled", str(window)])

    def fullscreen(mode: Literal[0, 1, 2] = 0):
        subprocess.run(["hyprctl", "dispatch", "fullscreen", str(mode)])

    def fake_fullscreen():
        subprocess.run(["hyprctl", "dispatch", "fakefullscreen"])

    def dpms(state: OnOffToggle):
        subprocess.run(["hyprctl", "dispatch", "dpms", str(state)])
    
    def pin(window: Union[WindowIdentifier, Literal["active"]] = "active"):
        subprocess.run(["hyprctl", "dispatch", "pin", str(window)])

    def move_focus(direction: Direction):
        subprocess.run(["hyprctl", "dispatch", "movefocus", str(direction)])
    
    def move_window_direction(move: Direction):
        subprocess.run(["hyprctl", "dispatch", "movewindow", str(move)])
    
    def move_window_monitor(move: MonitorIdentifier):
        subprocess.run(["hyprctl", "dispatch", "movewindow", f"mon:{move}"])
    
    def swap_window(direction: Direction):
        subprocess.run(["hyprctl", "dispatch", "swapwindow", str(direction)])
    
    def center_window(respectReserved: bool = False):
        subprocess.run(["hyprctl", "dispatch", "centerwindow"] + (["1"] if respectReserved else []))
    
    def resize_active(params: ResizeParams):
        subprocess.run(["hyprctl", "dispatch", "resizeactive", str(params)])

    def move_active(params: ResizeParams):
        subprocess.run(["hyprctl", "dispatch", "moveactive", str(params)])
    
    def resize_window(window: WindowIdentifier, params: ResizeParams):
        subprocess.run(["hyprctl", "dispatch", "resizewindowpixel", str(params), str(window)])

    def move_window(window: WindowIdentifier, params: ResizeParams):
        subprocess.run(["hyprctl", "dispatch", "movewindowpixel", str(params), str(window)])

    def cycle_next(next: Literal["prev", "tiled", "floating", "prev tiled", "prev_floating"] = None):
        subprocess.run(["hyprctl", "dispatch", "cyclenext"] + ([] if next is None else [next]))
    
    def swap_next(prev: bool = False):
        subprocess.run(["hyprctl", "dispatch", "swapnext"] + (["prev"] if prev else []))
    
    def focus_window(window: WindowIdentifier):
        subprocess.run(["hyprctl", "dispatch", "focuswindow", str(window)])
    
    def focus_monitor(monitor: MonitorIdentifier):
        subprocess.run(["hyprctl", "dispatch", "focusmonitor", str(monitor)])

    def split_ratio(value: FloatValue):
        subprocess.run(["hyprctl", "dispatch", "splitratio", str(value)])
    
    def toggle_opaque():
        subprocess.run(["hyprctl", "dispatch", "toggleopaque"])
    
    def move_cursor_to_corner(corner: Corner):
        subprocess.run(["hyprctl", "dispatch", "movecursortocorner", str(corner)])
    
    def move_cursor(x: int, y: int):
        subprocess.run(["hyprctl", "dispatch", "movecursor", f"{x} {y}"])
    
    def rename_workspace(id: int, name: str):
        subprocess.run(["hyprctl", "dispatch", "renameworkspace", f"{id} {name}"])
    
    def exit():
        subprocess.run(["hyprctl", "dispatch", "exit"])
    
    def force_render_reload():
        subprocess.run(["hyprctl", "dispatch", "forcerenderreload"])

    def move_workspace_to_monitor(workspace: WorkspaceIdentifier, monitor: MonitorIdentifier):
        subprocess.run(["hyprctl", "dispatch", "moveworkspacetomonitor", f"{workspace} {monitor}"])

    def swap_active_workspaces(monitor1: MonitorIdentifier, monitor2: MonitorIdentifier):
        subprocess.run(["hyprctl", "dispatch", "swapactiveworkspaces", f"{monitor1} {monitor2}"])

    def bring_active_to_top():
        subprocess.run(["hyprctl", "dispatch", "bringactivetotop"])
    
    def alter_z_order(z: ZHeight, window: WindowIdentifier = None):
        subprocess.run(["hyprctl", "dispatch", "alterzorder", str(z)] + ([str(window)] if window else []))

    def toggle_special_workspace(workspace: SpecialWorkspace = None):
        subprocess.run(["hyprctl", "dispatch", "togglespecialworkspace"] + ([str(workspace.value)] if workspace else []))
    
    def focus_urgent_or_last():
        subprocess.run(["hyprctl", "dispatch", "focusurgentorlast"])

    def toggle_group():
        subprocess.run(["hyprctl", "dispatch", "togglegroup"])
    
    def change_group_active(active: Union[Literal["b", "f"], int]):
        assert not isinstance(active, int) or active > 0
        subprocess.run(["hyprctl", "dispatch", "changegroupactive", str(active)])
    
    def focus_current_or_last():
        subprocess.run(["hyprctl", "dispatch", "focuscurrentorlast"])
    
    def toggle_lock_groups():
        subprocess.run(["hyprctl", "dispatch", "lockgroups", "toggle"])

    def lock_groups(lock: bool):
        subprocess.run(["hyprctl", "dispatch", "lockgroups", "lock" if lock else "unlock"])
    
    def toggle_lock_active_group():
        subprocess.run(["hyprctl", "dispatch", "lockactivegroup", "toggle"])

    def lock_active_group(lock: bool):
        subprocess.run(["hyprctl", "dispatch", "lockactivegroup", "lock" if lock else "unlock"])
    
    def move_into_group(direction: Direction):
        subprocess.run(["hyprctl", "dispatch", "moveintogroup", str(direction)])
    
    def move_out_of_group(window: Union[Literal["active"], WindowIdentifier] = None):
        subprocess.run(["hyprctl", "dispatch", "moveoutofgroup"] + ([str(window)] if window else []))
    
    def move_window_or_group(direction: Direction):
        subprocess.run(["hyprctl", "dispatch", "movewindoworgroup", str(direction)])

    def toggle_deny_window_from_group():
        subprocess.run(["hyprctl", "dispatch", "denywindowfromgroup", "toggle"])
    
    def deny_window_from_group(deny: bool):
        subprocess.run(["hyprctl", "dispatch", "denywindowfromgroup", "on" if deny else "off"])

    def toggle_set_ignore_group_lock():
        subprocess.run(["hyprctl", "dispatch", "setignoregrouplock", "toggle"])

    def set_ignore_group_lock(ignore: bool):
        subprocess.run(["hyprctl", "dispatch", "setignoregrouplock", "on" if ignore else "off"])


def keyword(key: str, value: str):
    subprocess.run(["hyprctl", "keyword", key, value])

def reload():
    subprocess.run(["hyprctl", "reload"])

def kill():
    subprocess.run(["hyprctl", "kill"])

def set_cursor(name: str, size: int):
    subprocess.run(["hyprctl", "setcursor", name, str(size)])

def set_prop(name: str, value: str):
    subprocess.run(["hyprctl", "setprop", name, value])

class MonitorWorkspace(TypedDict):
    id: int
    name: str

class Monitor(TypedDict):
    id: int
    name: str
    description: str
    make: str
    model: str
    serial: str
    width: int
    height: int
    refreshRate: float
    x: int
    y: int
    activeWorkspace: MonitorWorkspace
    specialWorkspace: MonitorWorkspace
    reserved: list[int]
    scale: float
    transform: int
    focused: bool
    dpmsStatus: bool
    vrr: bool
    activelyTearing: bool
    currentFormat: str
    availableModes: list[str]

def monitors() -> list[Monitor]:
    monitors = subprocess.run(["hyprctl", "monitors", "-j"], capture_output=True).stdout.decode("utf-8")
    return json.loads(monitors)

class Workspace(TypedDict):
    id: int
    name: str
    monitor: str
    monitorID: int
    windows: int
    hasfullscreen: bool
    lastwindow: str
    lastwindowtitle: str

def workspaces() -> list[Workspace]:
    workspaces = subprocess.run(["hyprctl", "workspaces", "-j"], capture_output=True).stdout.decode("utf-8")
    return json.loads(workspaces)

def active_workspace() -> Workspace:
    active = subprocess.run(["hyprctl", "activeworkspace", "-j"], capture_output=True).stdout.decode("utf-8")
    return json.loads(active)

Window = TypedDict('Window', {
    'class': str,
    'address': str,
    'mapped': bool,
    'hidden': bool,
    'at': list[int],
    'size': list[int],
    'workspace': MonitorWorkspace,
    'floating': bool,
    'monitor': int,
    'title': str,
    'pid': int,
    'xwayland': bool,
    'pinned': bool,
    'fullscreen': bool,
    'fullscreenMode': int,
    'fakeFullscreen': bool,
    'grouped': list[any],
    'swallowing': str,
    'focusHistoryID': int
})

def clients() -> list[Window]:
    clients = subprocess.run(["hyprctl", "clients", "-j"], capture_output=True).stdout.decode("utf-8")
    return json.loads(clients)

def active_window() -> Window:
    active = subprocess.run(["hyprctl", "activewindow", "-j"], capture_output=True).stdout.decode("utf-8")
    return json.loads(active)

