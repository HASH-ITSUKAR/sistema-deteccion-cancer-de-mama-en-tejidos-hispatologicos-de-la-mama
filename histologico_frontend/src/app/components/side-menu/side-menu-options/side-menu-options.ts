import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from "../../otros/icon/icon";
import { Icon } from 'src/app/interfaces/otros/icon';
import { TranslateModule } from '@ngx-translate/core'; // ✅ Agregado

interface MenuOption {
  icon: Icon;
  label: string;
  subLabel: string;
  route: string;
}

@Component({
  selector: 'app-side-menu-options',
  imports: [RouterLink, RouterLinkActive, IconComponent, TranslateModule], // ✅ Agregado
  templateUrl: './side-menu-options.html'
})
export class SideMenuOptions {
  menuOptions: MenuOption[] = [
    {
      icon: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        d: 'M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19'
      },
      label: 'MENU.HOME.TITLE',
      subLabel: 'MENU.HOME.SUB',
      route: '/inicio',
    },
    {
      icon: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        d: 'M4 19v1h18v2H2V2h2v15c3 0 6-2 8.1-5.6c3-5 6.3-7.4 9.9-7.4v2c-2.8 0-5.5 2.1-8.1 6.5C11.3 16.6 7.7 19 4 19'
      },
      label: 'MENU.PREDICT.TITLE',
      subLabel: 'MENU.PREDICT.SUB',
      route: '/prediccion',
    },
  ]
}
