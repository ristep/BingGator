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
const Gio = imports.gi.Gio;
 
const Me = imports.misc.extensionUtils.getCurrentExtension();

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const tmpfile = "/tmp/binga.json"

const getUrl = async (ndx) => {
    GLib.spawn_command_line_sync('/usr/bin/curl https://www.bing.com/HPImageArchive.aspx?format=js&idx='+ndx+'&n=1&mkt=en-US -s -o '+ tmpfile);
    let text = GLib.file_get_contents(tmpfile)[1];
    let json_result = JSON.parse(text);
    setWallpaper("https://www.bing.com/"+json_result.images[0].url);
};

const showInfo = () => {
    let text = GLib.file_get_contents(tmpfile)[1];
    let json_result = JSON.parse(text);
    Util.spawn(["xdg-open", json_result.images[0].copyrightlink]);
//    return json_result.images[0].copyrightlink;
}; 

 const WallpaperSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
 
 const setWallpaper = (uri) => {
     WallpaperSettings.set_string('picture-uri', uri);
     WallpaperSettings.set_string('picture-uri-dark', uri);
 };

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Bing Get Wallpaper'));

            this.add_child(new St.Icon({
                icon_name: 'system-run-symbolic',
                style_class: 'ikona-be-daa'//'system-status-icon',
            }));

            let item0 = new PopupMenu.PopupMenuItem(_('Wallpaper of the Day'));
            let item1 = new PopupMenu.PopupMenuItem(_('Yestardays wallpaper'));
            let item2 = new PopupMenu.PopupMenuItem(_('Day before yestarday'));
            let item3 = new PopupMenu.PopupMenuItem(_('Three days before'));
            let item4 = new PopupMenu.PopupMenuItem(_('Four days before'));
            let item5 = new PopupMenu.PopupMenuItem(_('Five days before'));
            let separator = new PopupMenu.PopupSeparatorMenuItem();
            let itemAbout = new PopupMenu.PopupMenuItem(_('About photo'));

            item0.connect('activate', () => {
                Main.notify(_('Wallpaper of the Day!'));
                getUrl(0);
            });

            item1.connect('activate', () => {
                Main.notify(_('Yestardays wallpaper!')); 
                getUrl(1);
            });

            item2.connect('activate', () => {
                Main.notify(_('Two days ago!'));
                getUrl(2);
            });

            item3.connect('activate', () => {
                Main.notify(_('Three days ago!'));
                getUrl(3);
            });

            item4.connect('activate', () => {
                Main.notify(_('Four days ago!'));
                getUrl(4);
            });

            item5.connect('activate', () => {
                Main.notify(_('Five  days ago!'));
                getUrl(5);
            });

            itemAbout.connect('activate', () => {
                Main.notify(_(showInfo()));
                showInfo();
            });  

            this.menu.addMenuItem(item0);
            this.menu.addMenuItem(item1);
            this.menu.addMenuItem(item2);
            this.menu.addMenuItem(item3);
            this.menu.addMenuItem(item4);
            this.menu.addMenuItem(item5);
            this.menu.addMenuItem(separator);
            this.menu.addMenuItem(itemAbout)
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
