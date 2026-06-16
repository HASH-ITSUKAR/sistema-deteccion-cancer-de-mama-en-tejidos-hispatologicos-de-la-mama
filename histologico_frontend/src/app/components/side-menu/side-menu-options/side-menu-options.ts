import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from "../../otros/icon/icon";
import { Icon } from 'src/app/interfaces/otros/icon';
import { TranslateModule } from '@ngx-translate/core';

// Interfaz limpia exclusiva para la definición de tus opciones
interface RawMenuOption {
  icon: {
    d: string;
    viewBox?: string;
  };
  label: string;
  subLabel: string;
  route: string;
}

@Component({
  selector: 'app-side-menu-options',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, TranslateModule],
  templateUrl: './side-menu-options.html'
})
export class SideMenuOptions {

  // 1. Definición raw super limpia (sin propiedades SVG repetidas)
  private rawMenuOptions: RawMenuOption[] = [
    {
      icon: {
        viewBox: '0 0 24 24',
        d: 'M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19'
      },
      label: 'MENU.HOME.TITLE',
      subLabel: 'MENU.HOME.SUB',
      route: '/inicio',
    },
    {
      icon: {
        viewBox: '0 0 24 24',
        d: 'M4 19v1h18v2H2V2h2v15c3 0 6-2 8.1-5.6c3-5 6.3-7.4 9.9-7.4v2c-2.8 0-5.5 2.1-8.1 6.5C11.3 16.6 7.7 19 4 19'
      },
      label: 'MENU.PREDICT.TITLE',
      subLabel: 'MENU.PREDICT.SUB',
      route: '/prediccion',
    },
    {
      icon: {
        viewBox: '0 0 24 24',
        d: 'M8 3H6v3H3v2h3v3h2V8h3V6H8zm5 3h8v2h-8zm0 8h8v2h-8zm0 4h8v2h-8zm-3.46-4.96L7 15.59l-2.54-2.55l-1.42 1.42L5.59 17l-2.55 2.54l1.42 1.42L7 18.41l2.54 2.55l1.42-1.42L8.41 17l2.55-2.54z'
      },
      label: 'MENU.METRICS.TITLE',
      subLabel: 'MENU.METRICS.SUB',
      route: '/metricas',
    },
    {
      icon: {
        viewBox: '0 0 24 24',
        d: 'M2.226 2h20v9h-20zm6.002 3.5H6.224v2.004h2.004zM2.226 13h20v9h-20zm6.002 3.5H6.224v2.004h2.004z'
      },
      label: 'MENU.EDA.TITLE',
      subLabel: 'MENU.EDA.SUB',
      route: '/eda',
    },
    {
      icon: {
        viewBox: '0 0 24 24',
        d: 'M8.625 9.975a1.125 1.125 0 1 0 0-2.25a1.125 1.125 0 0 0 0 2.25m0 3.6a1.125 1.125 0 1 0 0-2.25a1.125 1.125 0 0 0 0 2.25M16.5 12.45a1.125 1.125 0 1 1-2.25 0a1.125 1.125 0 0 1 2.25 0m-9.675-.675a1.125 1.125 0 1 0 0-2.25a1.125 1.125 0 0 0 0 2.25M14.7 10.65a1.125 1.125 0 1 1-2.25 0a1.125 1.125 0 0 1 2.25 0m-4.275 1.125a1.125 1.125 0 1 0 0-2.25a1.125 1.125 0 0 0 0 2.25M18.3 10.65a1.124 1.124 0 1 1-2.25 0a1.124 1.124 0 0 1 2.25 0m-2.925-.675a1.125 1.125 0 1 0 0-2.25a1.125 1.125 0 0 0 0 2.25m-2.475 2.7a.9.9 0 1 1-1.8 0a.9.9 0 0 1 1.8 0m-2.7 2.7a.9.9 0 1 0 0-1.8a.9.9 0 0 0 0 1.8m9.45-2.7a.9.9 0 1 1-1.8 0a.9.9 0 0 1 1.8 0m-2.25 2.7a.9.9 0 1 0 0-1.8a.9.9 0 0 0 0 1.8m-11.25-2.7a.9.9 0 1 1-1.8 0a.9.9 0 0 1 1.8 0m-2.7 1.8a.45.45 0 1 0 0-.9a.45.45 0 0 0 0 .9m2.25 1.35a.45.45 0 1 1-.9 0a.45.45 0 0 1 .9 0m6.3.45a.45.45 0 1 0 0-.9a.45.45 0 0 0 0 .9m7.2-.45a.45.45 0 1 1-.9 0a.45.45 0 0 1 .9 0m1.35-1.35a.45.45 0 1 0 0-.899a.45.45 0 0 0 0 .899m-12.825 0a.9.9 0 1 1-1.8 0a.9.9 0 0 1 1.8 0m5.85.9a.9.9 0 1 0 0-1.8a.9.9 0 0 0 0 1.8'
      },
      label: 'MENU.EVAL.TITLE',
      subLabel: 'MENU.EVAL.SUB',
      route: '/evaluacion',
    },
    {
      icon: {
        viewBox: '0 0 24 24',
        d: 'M11 17v-1h2v1zm0-1.5v-.775q-.475-.275-.737-.737T10 13q0-.825.588-1.412T12 11t1.413.588T14 13q0 .525-.262.988t-.738.737v.775zm5 .45l-1.05-1.075q.275-.425.413-.9T15.5 13t-.138-.975t-.412-.9L16 10.05q.5.65.75 1.4T17 13t-.25 1.55t-.75 1.4m-8 0q-.5-.65-.75-1.4T7 13q0-2.075 1.463-3.537T12 8V6.75l2.25 2l-2.25 2V9.5q-1.45 0-2.475 1.025T8.5 13q0 .5.138.975t.412.9zM6 23q-.825 0-1.412-.587T4 21V3q0-.825.588-1.412T6 1h12q.825 0 1.413.588T20 3v18q0 .825-.587 1.413T18 23zm0-5h12V6H6zm0 2v1h12v-1zM6 4h12V3H6zm0-1v1zm0 18v-1z'
      },
      label: 'MENU.TRAIN.TITLE',
      subLabel: 'MENU.TRAIN.SUB',
      route: '/entrenamiento',
    },
  ];

  // 2. Este es el array que leerá el HTML. Mapea los iconos inyectándoles los valores obligatorios automáticamente.
  menuOptions = this.rawMenuOptions.map(option => ({
    ...option,
    icon: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
      fill: 'currentColor',
      viewBox: option.icon.viewBox || '0 0 24 24',
      d: option.icon.d
    } as Icon // <-- Casteo seguro e infalible aquí
  }));
}
