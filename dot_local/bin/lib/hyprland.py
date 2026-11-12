import subprocess, json, re, shlex
from enum import Enum
from typing import TypeAlias, Union, Literal, TypedDict, Annotated

class WindowClass:
    def __init__(self, value: re.Pattern) -> None:
        self.value = value

    def __str__(self) -> str:
        return f"class:{self.value.pattern}"

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

def _lua_str(value: str) -> str:
    """Quote a python string as a lua string literal for hl.dsp expressions."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'


def _dispatch(lua_expr: str):
    """Run a lua dispatcher expression via `hyprctl dispatch` (wraps in hl.dispatch)."""
    subprocess.run(["hyprctl", "dispatch", lua_expr])


_DIRECTION_LUA = {
    Direction.LEFT: "left",
    Direction.RIGHT: "right",
    Direction.UP: "up",
    Direction.DOWN: "down",
}


def _direction(direction) -> str:
    return _DIRECTION_LUA.get(direction, str(direction))


def _focused_monitor_size() -> tuple[int, int]:
    """(width, height) of the focused monitor, for percent resize/move params."""
    try:
        for mon in monitors():
            if mon.get("focused"):
                return mon["width"], mon["height"]
    except Exception:
        pass
    return 1920, 1080


def _px_params(params: "ResizeParams") -> tuple[int, int]:
    """Resolve ResizeParams to absolute pixels (percents are monitor-relative)."""
    mw, mh = _focused_monitor_size()
    w = int(mw * params.width / 100) if params.percentWidth else params.width
    h = int(mh * params.height / 100) if params.percentHeight else params.height
    return w, h


class Dispatcher:
    """Hyprland dispatchers as `hl.dsp.*` lua expressions (hyprctl dispatch)."""

    @staticmethod
    def _window_arg(window, active_ok: bool = True) -> str:
        if window is None or (active_ok and window == "active"):
            return ""
        return f", window = {_lua_str(str(window))}"

    @staticmethod
    def exec(command: list[str]):
        _dispatch(f"hl.dsp.exec_cmd({_lua_str(shlex.join(command))})")

    @staticmethod
    def execr(command: list[str]):
        _dispatch(f"hl.dsp.exec_raw({_lua_str(' '.join(command))})")

    @staticmethod
    def kill_active():
        _dispatch("hl.dsp.window.kill()")

    @staticmethod
    def close_window(window: WindowIdentifier):
        _dispatch(f"hl.dsp.window.close({{ window = {_lua_str(str(window))} }})")

    @staticmethod
    def workspace(workspace: WorkspaceIdentifier):
        _dispatch(f"hl.dsp.focus({{ workspace = {_lua_str(str(workspace))} }})")

    @staticmethod
    def move_to_workspace(workspace: WorkspaceIdentifier, window: WindowIdentifier = None, silent: bool = False):
        args = f"workspace = {_lua_str(str(workspace))}, follow = {str(not silent).lower()}"
        if window:
            args += f", window = {_lua_str(str(window))}"
        _dispatch(f"hl.dsp.window.move({{ {args} }})")

    @staticmethod
    def toggle_floating(window: Union[WindowIdentifier, Literal["active"], None] = None):
        _dispatch(f"hl.dsp.window.float({{ action = \"toggle\"{Dispatcher._window_arg(window)} }})")

    @staticmethod
    def set_floating(window: WindowIdentifier, value: bool = True):
        action = "on" if value else "off"
        _dispatch(f"hl.dsp.window.float({{ action = \"{action}\", window = {_lua_str(str(window))} }})")

    @staticmethod
    def fullscreen(mode: Literal[0, 1, 2] = 0):
        # Toggle semantics: fullscreen(current_mode) unsets; 0 always unsets.
        try:
            current = active_window().get("fullscreen", 0)
        except Exception:
            current = 0
        if mode == 0 or current == mode:
            _dispatch('hl.dsp.window.fullscreen({ action = "unset" })')
        else:
            m = "maximized" if mode == 1 else "fullscreen"
            _dispatch(f'hl.dsp.window.fullscreen({{ mode = "{m}", action = "set" }})')

    @staticmethod
    def fake_fullscreen():
        _dispatch('hl.dsp.window.fullscreen({ mode = "fullscreen", action = "set", layout_aware = false })')

    @staticmethod
    def dpms(state: OnOffToggle):
        _dispatch(f"hl.dsp.dpms({{ action = {_lua_str(str(state))} }})")

    @staticmethod
    def pin(window: Union[WindowIdentifier, Literal["active"], None] = None):
        _dispatch(f"hl.dsp.window.pin({{ action = \"toggle\"{Dispatcher._window_arg(window)} }})")

    @staticmethod
    def move_focus(direction: Direction):
        _dispatch(f"hl.dsp.focus({{ direction = {_lua_str(_direction(direction))} }})")

    @staticmethod
    def move_window_direction(move: Direction):
        _dispatch(f"hl.dsp.window.move({{ direction = {_lua_str(_direction(move))} }})")

    @staticmethod
    def move_window_monitor(move: MonitorIdentifier):
        _dispatch(f"hl.dsp.window.move({{ monitor = {_lua_str(str(move))} }})")

    @staticmethod
    def swap_window(direction: Direction):
        _dispatch(f"hl.dsp.window.swap({{ direction = {_lua_str(_direction(direction))} }})")

    @staticmethod
    def center_window(respectReserved: bool = False):
        _dispatch("hl.dsp.window.center()")

    @staticmethod
    def resize_active(params: ResizeParams):
        w, h = _px_params(params)
        rel = "false" if params.exact else "true"
        _dispatch(f"hl.dsp.window.resize({{ x = {w}, y = {h}, relative = {rel} }})")

    @staticmethod
    def move_active(params: ResizeParams):
        w, h = _px_params(params)
        _dispatch(f"hl.dsp.window.move({{ x = {w}, y = {h} }})")

    @staticmethod
    def resize_window(window: WindowIdentifier, params: ResizeParams):
        w, h = _px_params(params)
        rel = "false" if params.exact else "true"
        _dispatch(f"hl.dsp.window.resize({{ x = {w}, y = {h}, relative = {rel}, window = {_lua_str(str(window))} }})")

    @staticmethod
    def move_window(window: WindowIdentifier, params: ResizeParams):
        w, h = _px_params(params)
        _dispatch(f"hl.dsp.window.move({{ x = {w}, y = {h}, window = {_lua_str(str(window))} }})")

    @staticmethod
    def cycle_next(next: Literal["prev", "tiled", "floating", "prev tiled", "prev_floating"] = None):
        opts = ""
        if next == "prev":
            opts = "next = false"
        elif next == "tiled":
            opts = "tiled = true"
        elif next == "floating":
            opts = "floating = true"
        elif next == "prev tiled":
            opts = "next = false, tiled = true"
        elif next == "prev_floating":
            opts = "next = false, floating = true"
        _dispatch(f"hl.dsp.window.cycle_next({{ {opts} }})" if opts else "hl.dsp.window.cycle_next()")

    @staticmethod
    def swap_next(prev: bool = False):
        _dispatch("hl.dsp.window.swap({ prev = true })" if prev else "hl.dsp.window.swap({ next = true })")

    @staticmethod
    def focus_window(window: WindowIdentifier):
        _dispatch(f"hl.dsp.focus({{ window = {_lua_str(str(window))} }})")

    @staticmethod
    def focus_monitor(monitor: MonitorIdentifier):
        _dispatch(f"hl.dsp.focus({{ monitor = {_lua_str(str(monitor))} }})")

    @staticmethod
    def split_ratio(value: FloatValue):
        _dispatch(f"hl.dsp.layout({_lua_str('splitratio ' + str(value))})")

    @staticmethod
    def toggle_opaque():
        _dispatch('hl.dsp.window.set_prop({ prop = "opaque", value = "toggle" })')

    @staticmethod
    def move_cursor_to_corner(corner: Corner):
        _dispatch(f"hl.dsp.cursor.move_to_corner({{ corner = {corner.value} }})")

    @staticmethod
    def move_cursor(x: int, y: int):
        _dispatch(f"hl.dsp.cursor.move({{ x = {x}, y = {y} }})")

    @staticmethod
    def rename_workspace(id: int, name: str):
        _dispatch(f"hl.dsp.workspace.rename({{ workspace = {_lua_str(str(id))}, name = {_lua_str(name)} }})")

    @staticmethod
    def exit():
        _dispatch("hl.dsp.exit()")

    @staticmethod
    def force_render_reload():
        _dispatch("hl.dsp.force_renderer_reload()")

    @staticmethod
    def move_workspace_to_monitor(workspace: WorkspaceIdentifier, monitor: MonitorIdentifier):
        _dispatch(f"hl.dsp.workspace.move({{ workspace = {_lua_str(str(workspace))}, monitor = {_lua_str(str(monitor))} }})")

    @staticmethod
    def swap_active_workspaces(monitor1: MonitorIdentifier, monitor2: MonitorIdentifier):
        _dispatch(f"hl.dsp.workspace.swap_monitors({{ monitor1 = {_lua_str(str(monitor1))}, monitor2 = {_lua_str(str(monitor2))} }})")

    @staticmethod
    def bring_active_to_top():
        _dispatch("hl.dsp.window.bring_to_top()")

    @staticmethod
    def alter_z_order(z: ZHeight, window: WindowIdentifier = None):
        _dispatch(f"hl.dsp.window.alter_zorder({{ mode = {_lua_str(str(z))}{Dispatcher._window_arg(window)} }})")

    @staticmethod
    def toggle_special_workspace(workspace: SpecialWorkspace = None):
        if workspace:
            _dispatch(f"hl.dsp.workspace.toggle_special({_lua_str(workspace.value)})")
        else:
            _dispatch("hl.dsp.workspace.toggle_special()")

    @staticmethod
    def focus_urgent_or_last():
        _dispatch("hl.dsp.focus({ urgent_or_last = true })")

    @staticmethod
    def toggle_group():
        _dispatch("hl.dsp.group.toggle()")

    @staticmethod
    def change_group_active(active: Union[Literal["b", "f"], int]):
        if active == "b":
            _dispatch("hl.dsp.group.prev()")
        elif active == "f":
            _dispatch("hl.dsp.group.next()")
        else:
            assert not isinstance(active, int) or active > 0
            _dispatch(f"hl.dsp.group.active({{ index = {active} }})")

    @staticmethod
    def focus_current_or_last():
        _dispatch("hl.dsp.focus({ last = true })")

    @staticmethod
    def toggle_lock_groups():
        _dispatch('hl.dsp.group.lock({ all = true, action = "toggle" })')

    @staticmethod
    def lock_groups(lock: bool):
        action = "on" if lock else "off"
        _dispatch(f'hl.dsp.group.lock({{ all = true, action = "{action}" }})')

    @staticmethod
    def toggle_lock_active_group():
        _dispatch('hl.dsp.group.lock_active({ action = "toggle" })')

    @staticmethod
    def lock_active_group(lock: bool):
        action = "on" if lock else "off"
        _dispatch(f'hl.dsp.group.lock_active({{ action = "{action}" }})')

    @staticmethod
    def move_into_group(direction: Direction):
        _dispatch(f"hl.dsp.window.move({{ into_group = {_lua_str(_direction(direction))} }})")

    @staticmethod
    def move_out_of_group(window: Union[Literal["active"], WindowIdentifier, None] = None):
        _dispatch(f"hl.dsp.window.move({{ out_of_group = true{Dispatcher._window_arg(window)} }})")

    @staticmethod
    def move_window_or_group(direction: Direction):
        _dispatch(f"hl.dsp.window.move({{ direction = {_lua_str(_direction(direction))}, group_aware = true }})")

    @staticmethod
    def toggle_deny_window_from_group():
        _dispatch('hl.dsp.window.deny_from_group({ action = "toggle" })')

    @staticmethod
    def deny_window_from_group(deny: bool):
        action = "on" if deny else "off"
        _dispatch(f'hl.dsp.window.deny_from_group({{ action = "{action}" }})')

    @staticmethod
    def toggle_set_ignore_group_lock():
        _dispatch('hl.dsp.window.set_prop({ prop = "ignore_group_lock", value = "toggle" })')

    @staticmethod
    def set_ignore_group_lock(ignore: bool):
        value = "on" if ignore else "off"
        _dispatch(f'hl.dsp.window.set_prop({{ prop = "ignore_group_lock", value = "{value}" }})')


def keyword(key: str, value: str):
    subprocess.run(["hyprctl", "keyword", key, value])

def reload():
    subprocess.run(["hyprctl", "reload"])

def kill():
    subprocess.run(["hyprctl", "kill"])

def set_cursor(name: str, size: int):
    subprocess.run(["hyprctl", "setcursor", name, str(size)])

def set_prop(window: WindowIdentifier, name: str, value: str):
    subprocess.run(["hyprctl", "setprop", str(window), name, value])

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
    'initialClass': str,
    'initialTitle': str,
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
    'fullscreen': int,
    'fullscreenClient': int,
    'grouped': list,
    'tags': list[str],
    'swallowing': str,
    'focusHistoryID': int
})

def clients() -> list[Window]:
    clients = subprocess.run(["hyprctl", "clients", "-j"], capture_output=True).stdout.decode("utf-8")
    return json.loads(clients)

def active_window() -> Window:
    active = subprocess.run(["hyprctl", "activewindow", "-j"], capture_output=True).stdout.decode("utf-8")
    return json.loads(active)

