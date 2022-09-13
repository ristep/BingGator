/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'Bing-Gator-extension';

const { GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const tmpfile = "/tmp/binga.json"

const getUrl = async (ndx) => {
    //GLib.spawn_command_line_sync('/usr/bin/curl https://bing.biturl.top/?index='+ ndx + ' -s -o '+ tmpfile);
    GLib.spawn_command_line_sync('/usr/bin/curl https://www.bing.com/HPImageArchive.aspx?format=js&idx='+ndx+'&n=1&mkt=en-US -s -o '+ tmpfile);
    let text = GLib.file_get_contents(tmpfile)[1];
    let json_result = JSON.parse(text);
    setWallpaper("https://www.bing.com/"+json_result.images[0].url);
    // setWallpaper(json_result.url);
};

const setWallpaper = (uri) => {
    Util.spawn(["/usr/bin/gsettings", "set", "org.gnome.desktop.background", "picture-uri", uri]);
    Util.spawn(["/usr/bin/gsettings", "set", "org.gnome.desktop.background", "picture-uri-dark", uri]);
};

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Bing Get Wallpaper'));

            this.add_child(new St.Icon({
                icon_name: 'face-smile-symbolic',
                style_class: 'system-status-icon',
            }));

            let item1 = new PopupMenu.PopupMenuItem(_('Wallpaper of the Day'));
            let item2 = new PopupMenu.PopupMenuItem(_('Yestardays wallpaper'));
            let item3 = new PopupMenu.PopupMenuItem(_('Two days of the Day'));
            let item4 = new PopupMenu.PopupMenuItem(_('Three days of the Day'));
            item1.connect('activate', () => {
                Main.notify(_('Wallpaper of the Day!'));
                getUrl(0);
            });

            item2.connect('activate', () => {
                Main.notify(_('Yestardays wallpaper!'));
                getUrl(1);
            });

            item3.connect('activate', () => {
                Main.notify(_('Two days ago!'));
                const rnd = 2;
                getUrl(rnd);
            });
            item4.connect('activate', () => {
                Main.notify(_('Three days ago!'));
                const rnd = 3;
                getUrl(rnd);
            });

            this.menu.addMenuItem(item1);
            this.menu.addMenuItem(item2);
            this.menu.addMenuItem(item3);
            this.menu.addMenuItem(item4);
        }
    });

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
