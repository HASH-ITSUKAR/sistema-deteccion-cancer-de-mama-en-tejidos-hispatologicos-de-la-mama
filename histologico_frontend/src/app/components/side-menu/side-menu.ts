import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SideMenuHeader } from "./side-menu-header/side-menu-header";
import { SideMenuOptions } from "./side-menu-options/side-menu-options";
import { SideMenuLanguage } from "./side-menu-language/side-menu-language";

@Component({
  selector: 'app-side-menu',
  imports: [SideMenuHeader, SideMenuOptions, SideMenuLanguage],
  templateUrl: './side-menu.html'
})
export class SideMenu { }
